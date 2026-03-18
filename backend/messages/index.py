"""
API для работы с сообщениями мессенджера.
GET  /?chat_id=X        — получить сообщения чата
POST /                  — отправить сообщение
PUT  /?action=read&chat_id=X — пометить сообщения прочитанными
"""
import json
import os
import psycopg2

SCHEMA = "t_p32382310_messenger_chat_initi"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_id(event: dict, conn) -> str | None:
    headers = event.get("headers") or {}
    token = (
        headers.get("X-Session-Token")
        or headers.get("x-session-token")
        or (event.get("queryStringParameters") or {}).get("token", "")
    )
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s AND expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    user_id = get_user_id(event, conn)

    if not user_id:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Unauthorized"})}

    if method == "GET":
        return get_messages(event, conn, user_id)
    elif method == "POST":
        return send_message(event, conn, user_id)
    elif method == "PUT" and action == "read":
        return mark_read(event, conn, user_id)

    conn.close()
    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def get_messages(event: dict, conn, user_id: str) -> dict:
    params = event.get("queryStringParameters") or {}
    chat_id = params.get("chat_id")
    if not chat_id:
        conn.close()
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chat_id required"})}

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
            "isMe": r[2] == user_id,
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": msgs, "currentUserId": user_id})}


def send_message(event: dict, conn, user_id: str) -> dict:
    body = json.loads(event.get("body") or "{}")
    chat_id = body.get("chatId")
    text = body.get("text", "").strip()
    msg_type = body.get("type", "text")
    duration = body.get("duration", 0)

    if not chat_id or not text:
        conn.close()
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chatId and text required"})}

    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text, type, duration, is_read) "
        f"VALUES (%s, %s, %s, %s, %s, false) RETURNING id, created_at",
        (chat_id, user_id, text, msg_type, duration)
    )
    row = cur.fetchone()
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "message": {
                "id": str(row[0]),
                "chatId": chat_id,
                "senderId": user_id,
                "text": text,
                "type": msg_type,
                "duration": duration,
                "read": False,
                "time": row[1].strftime("%H:%M"),
                "isMe": True,
            }
        })
    }


def mark_read(event: dict, conn, user_id: str) -> dict:
    params = event.get("queryStringParameters") or {}
    chat_id = params.get("chat_id")
    if not chat_id:
        conn.close()
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "chat_id required"})}

    cur = conn.cursor()
    cur.execute(
        f"UPDATE {SCHEMA}.messages SET is_read = true "
        f"WHERE chat_id = %s AND sender_id != %s AND is_read = false",
        (chat_id, user_id)
    )
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
