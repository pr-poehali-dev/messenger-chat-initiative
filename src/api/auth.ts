const AUTH_URL = 'https://functions.poehali.dev/f44085f3-4691-4d44-aadf-6f582f8ee100';
const CHATS_URL = 'https://functions.poehali.dev/145acb06-bce6-4b63-aa61-4d57b6bc4c67';

const LS_TOKEN = 'messenger_token';
const LS_USER = 'messenger_user';

export interface AuthUser {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  bio: string;
  status: string;
}

function parse(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export function getToken(): string {
  return localStorage.getItem(LS_TOKEN) || '';
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(LS_USER, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_USER);
}

export async function register(name: string, phone: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password }),
  });
  const data = parse(await res.json()) as { token?: string; user?: AuthUser; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || 'Ошибка регистрации');
  return { token: data.token!, user: data.user! };
}

export async function login(phone: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = parse(await res.json()) as { token?: string; user?: AuthUser; error?: string };
  if (!res.ok || data.error) throw new Error(data.error || 'Ошибка входа');
  return { token: data.token!, user: data.user! };
}

export async function logout(token: string): Promise<void> {
  await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
  });
}

export async function getMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${AUTH_URL}/?action=me`, {
    headers: { 'X-Session-Token': token },
  });
  if (!res.ok) return null;
  const data = parse(await res.json()) as { user?: AuthUser };
  return data.user || null;
}

export async function fetchUsers(token: string): Promise<AuthUser[]> {
  const res = await fetch(`${CHATS_URL}/?action=users`, {
    headers: { 'X-Session-Token': token },
  });
  const data = parse(await res.json()) as { users?: AuthUser[] };
  return data.users || [];
}

export async function createChat(token: string, userId: string): Promise<string> {
  const res = await fetch(CHATS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
    body: JSON.stringify({ userId }),
  });
  const data = parse(await res.json()) as { chatId?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.chatId!;
}
