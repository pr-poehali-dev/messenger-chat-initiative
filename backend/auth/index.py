"""
Авторизация пользователей мессенджера.
POST /register — регистрация по имени и номеру телефона
POST /login    — вход, возвращает session token
GET  /me       — получить текущего пользователя по токену
POST /logout   — выход (удаление сессии)
"""
import json
import os
import hashlib
import secrets
import uuid
import psycopg2

SCHEMA = "t_p32382310_messenger_chat_initi"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_token(event: dict) -> str:
    headers = event.get("headers") or {}
    return (
        headers.get("X-Session-Token")
        or headers.get("x-session-token")
        or (event.get("queryStringParameters") or {}).get("token", "")
    )


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if method == "POST" and "register" in path:
        return register(event)
    if method == "POST" and "login" in path:
        return login(event)
    if method == "POST" and "logout" in path:
        return logout(event)
    if method == "GET" and (action == "me" or "me" in path):
        return get_me(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def register(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    name = (body.get("name") or "").strip()
    phone = (body.get("phone") or "").strip()
    password = (body.get("password") or "").strip()

    if not name or not phone or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE phone = %s", (phone,))
    if cur.fetchone():
        conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Пользователь с этим номером уже существует"})}

    user_id = f"u_{uuid.uuid4().hex[:12]}"
    initials = "".join([w[0].upper() for w in name.split()[:2]])
    pw_hash = hash_password(password)

    cur.execute(
        f"INSERT INTO {SCHEMA}.users (id, name, avatar, status, bio, phone, password_hash) "
        f"VALUES (%s, %s, %s, 'online', '', %s, %s)",
        (user_id, name, initials, phone, pw_hash)
    )

    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id)
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "token": token,
            "user": {"id": user_id, "name": name, "avatar": initials, "phone": phone, "status": "online", "bio": ""}
        })
    }


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    phone = (body.get("phone") or "").strip()
    password = (body.get("password") or "").strip()

    if not phone or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введите телефон и пароль"})}

    conn = get_conn()
    cur = conn.cursor()
    pw_hash = hash_password(password)

    cur.execute(
        f"SELECT id, name, avatar, phone, bio, status FROM {SCHEMA}.users WHERE phone = %s AND password_hash = %s",
        (phone, pw_hash)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный номер или пароль"})}

    user_id, name, avatar, user_phone, bio, status = row

    cur.execute(f"UPDATE {SCHEMA}.users SET status = 'online' WHERE id = %s", (user_id,))

    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
        (token, user_id)
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "token": token,
            "user": {"id": user_id, "name": name, "avatar": avatar, "phone": user_phone, "bio": bio or "", "status": status or "online"}
        })
    }


def logout(event: dict) -> dict:
    token = get_token(event)
    if not token:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "No token"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s", (token,))
    row = cur.fetchone()
    if row:
        cur.execute(f"UPDATE {SCHEMA}.users SET status = 'offline' WHERE id = %s", (row[0],))
    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
    conn.commit()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}


def get_me(event: dict) -> dict:
    token = get_token(event)
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "No token"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.name, u.avatar, u.phone, u.bio, u.status "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id = u.id "
        f"WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Invalid or expired token"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "user": {"id": row[0], "name": row[1], "avatar": row[2], "phone": row[3], "bio": row[4] or "", "status": row[5] or "online"}
        })
    }
