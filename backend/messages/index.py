"""
API для работы с сообщениями мессенджера.
GET  /?chat_id=X        — получить сообщения чата
POST /                  — отправить сообщение
PUT  /read?chat_id=X    — пометить сообщения прочитанными
"""
import json
import os
import psycopg2

SCHEMA = "t_p32382310_messenger_chat_initi"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if method == "GET":
        return get_messages(event)
    elif method == "POST":
        return send_message(event)
    elif method == "PUT" and action == "read":
        return mark_read(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def get_messages(event: dict) -> dict:
    params = event.get("queryStringParameters") or {}
    chat_id = params.get("chat_id")
    if not chat_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chat_id required"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, chat_id, sender_id, text, type, duration, is_read, created_at "
        f"FROM {SCHEMA}.messages WHERE chat_id = %s ORDER BY created_at ASC",
        (chat_id,)
    )
    rows = cur.fetchall()
    conn.close()

    msgs = [
        {
            "id": str(r[0]),
            "chatId": r[1],
            "senderId": r[2],
            "text": r[3],
            "type": r[4],
            "duration": r[5] or 0,
            "read": r[6],
            "time": r[7].strftime("%H:%M"),
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": msgs})}


def send_message(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    chat_id = body.get("chatId")
    sender_id = body.get("senderId", "me")
    text = body.get("text", "").strip()
    msg_type = body.get("type", "text")
    duration = body.get("duration", 0)

    if not chat_id or not text:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chatId and text required"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text, type, duration, is_read) "
        f"VALUES (%s, %s, %s, %s, %s, false) RETURNING id, created_at",
        (chat_id, sender_id, text, msg_type, duration)
    )
    row = cur.fetchone()
    conn.commit()
    conn.close()

    msg = {
        "id": str(row[0]),
        "chatId": chat_id,
        "senderId": sender_id,
        "text": text,
        "type": msg_type,
        "duration": duration,
        "read": False,
        "time": row[1].strftime("%H:%M"),
    }
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": msg})}


def mark_read(event: dict) -> dict:
    params = event.get("queryStringParameters") or {}
    chat_id = params.get("chat_id")
    if not chat_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chat_id required"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE {SCHEMA}.messages SET is_read = true WHERE chat_id = %s AND sender_id != 'me' AND is_read = false",
        (chat_id,)
    )
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}