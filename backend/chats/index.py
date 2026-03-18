"""
API для получения списка чатов с последним сообщением и числом непрочитанных.
GET / — возвращает все чаты пользователя 'me'
"""
import json
import os
import psycopg2

SCHEMA = "t_p32382310_messenger_chat_initi"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    conn = get_conn()
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
             WHERE chat_id = c.id AND is_read = false AND sender_id != 'me') AS unread
        FROM {SCHEMA}.chats c
        LEFT JOIN LATERAL (
            SELECT text, type, created_at FROM {SCHEMA}.messages
            WHERE chat_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON true
        WHERE c.user1_id = 'me' OR c.user2_id = 'me'
        ORDER BY m.created_at DESC NULLS LAST
    """)

    rows = cur.fetchall()

    cur.execute(f"SELECT id, name, avatar, status, bio, phone FROM {SCHEMA}.users")
    users_rows = cur.fetchall()
    conn.close()

    users = {
        r[0]: {"id": r[0], "name": r[1], "avatar": r[2], "status": r[3], "bio": r[4], "phone": r[5]}
        for r in users_rows
    }

    chats = []
    for r in rows:
        chat_id, user1, user2, last_text, last_type, last_time, unread = r
        other_id = user2 if user1 == "me" else user1
        last_msg = last_text or ""
        if last_type == "voice":
            last_msg = "Голосовое сообщение"

        formatted_time = ""
        if last_time:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            diff = now - last_time.replace(tzinfo=timezone.utc) if last_time.tzinfo is None else now - last_time
            if diff.days == 0:
                formatted_time = last_time.strftime("%H:%M")
            elif diff.days == 1:
                formatted_time = "Вчера"
            elif diff.days < 7:
                days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
                formatted_time = days[last_time.weekday()]
            else:
                formatted_time = last_time.strftime("%d.%m")

        chats.append({
            "id": chat_id,
            "userId": other_id,
            "lastMessage": last_msg,
            "lastTime": formatted_time,
            "unread": int(unread or 0),
        })

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"chats": chats, "users": users}),
    }
