"""
API для работы со списком чатов.
GET  /              — список чатов текущего пользователя
POST /              — создать чат с пользователем
GET  /?action=users — список всех пользователей (для поиска контактов)
"""
import json
import os
import uuid
import psycopg2
from datetime import datetime, timezone

SCHEMA = "t_p32382310_messenger_chat_initi"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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


def format_time(last_time) -> str:
    if not last_time:
        return ""
    now = datetime.now(timezone.utc)
    lt = last_time.replace(tzinfo=timezone.utc) if last_time.tzinfo is None else last_time
    diff = now - lt
    if diff.days == 0:
        return lt.strftime("%H:%M")
    elif diff.days == 1:
        return "Вчера"
    elif diff.days < 7:
        return ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][lt.weekday()]
    return lt.strftime("%d.%m")


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

    if method == "GET" and action == "users":
        return get_users(conn, user_id)

    if method == "POST":
        return create_chat(event, conn, user_id)

    return get_chats(conn, user_id)


def get_chats(conn, user_id: str) -> dict:
    cur = conn.cursor()
    cur.execute(f"""
        SELECT
            c.id,
            c.user1_id,
            c.user2_id,
            m.text AS last_text,
            m.type AS last_type,
            m.created_at AS last_time,
            (SELECT COUNT(*) FROM {SCHEMA}.messages
             WHERE chat_id = c.id AND is_read = false AND sender_id != %s) AS unread
        FROM {SCHEMA}.chats c
        LEFT JOIN LATERAL (
            SELECT text, type, created_at FROM {SCHEMA}.messages
            WHERE chat_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE c.user1_id = %s OR c.user2_id = %s
        ORDER BY m.created_at DESC NULLS LAST
    """, (user_id, user_id, user_id))

    rows = cur.fetchall()

    cur.execute(f"SELECT id, name, avatar, status, bio, phone FROM {SCHEMA}.users WHERE id != %s", (user_id,))
    users_rows = cur.fetchall()
    conn.close()

    users = {
        r[0]: {"id": r[0], "name": r[1], "avatar": r[2], "status": r[3], "bio": r[4] or "", "phone": r[5] or ""}
        for r in users_rows
    }

    chats = []
    for r in rows:
        chat_id, user1, user2, last_text, last_type, last_time, unread = r
        other_id = user2 if user1 == user_id else user1
        last_msg = "Голосовое сообщение" if last_type == "voice" else (last_text or "")
        chats.append({
            "id": chat_id,
            "userId": other_id,
            "lastMessage": last_msg,
            "lastTime": format_time(last_time),
            "unread": int(unread or 0),
        })

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"chats": chats, "users": users})}


def get_users(conn, user_id: str) -> dict:
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, name, avatar, status, bio, phone FROM {SCHEMA}.users WHERE id != %s ORDER BY name",
        (user_id,)
    )
    rows = cur.fetchall()
    conn.close()
    users = [
        {"id": r[0], "name": r[1], "avatar": r[2], "status": r[3], "bio": r[4] or "", "phone": r[5] or ""}
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"users": users})}


def create_chat(event: dict, conn, user_id: str) -> dict:
    body = json.loads(event.get("body") or "{}")
    other_id = body.get("userId", "").strip()
    if not other_id:
        conn.close()
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "userId required"})}

    cur = conn.cursor()
    cur.execute(
        f"SELECT id FROM {SCHEMA}.chats WHERE (user1_id=%s AND user2_id=%s) OR (user1_id=%s AND user2_id=%s)",
        (user_id, other_id, other_id, user_id)
    )
    existing = cur.fetchone()
    if existing:
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"chatId": existing[0]})}

    chat_id = f"c_{uuid.uuid4().hex[:12]}"
    cur.execute(
        f"INSERT INTO {SCHEMA}.chats (id, user1_id, user2_id) VALUES (%s, %s, %s)",
        (chat_id, user_id, other_id)
    )
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"chatId": chat_id})}
