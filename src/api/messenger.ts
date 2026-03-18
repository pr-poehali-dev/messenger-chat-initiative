import { getToken } from './auth';

const CHATS_URL = 'https://functions.poehali.dev/145acb06-bce6-4b63-aa61-4d57b6bc4c67';
const MESSAGES_URL = 'https://functions.poehali.dev/276b388d-d419-4e14-9bb5-bb213221734f';
const UPLOAD_URL = 'https://functions.poehali.dev/670031e7-23af-443b-8bfa-119b304dcc51';

function parse(data: unknown): unknown {
  return typeof data === 'string' ? JSON.parse(data) : data;
}

function authHeaders(extra: Record<string, string> = {}) {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token ? { 'X-Session-Token': token } : {}), ...extra };
}

export interface ApiMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'voice';
  duration: number;
  read: boolean;
  time: string;
  isMe?: boolean;
}

export interface ApiChat {
  id: string;
  userId: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

export interface ApiUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  bio: string;
  phone: string;
}

export async function fetchChats(): Promise<{ chats: ApiChat[]; users: Record<string, ApiUser> }> {
  const res = await fetch(CHATS_URL, { headers: authHeaders() });
  const data = parse(await res.json()) as { chats?: ApiChat[]; users?: Record<string, ApiUser> };
  return { chats: data.chats || [], users: data.users || {} };
}

export async function fetchMessages(chatId: string): Promise<ApiMessage[]> {
  const token = getToken();
  const url = `${MESSAGES_URL}?chat_id=${encodeURIComponent(chatId)}${token ? `&token=${token}` : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = parse(await res.json()) as { messages?: ApiMessage[] };
  return data.messages || [];
}

export async function sendMessage(payload: {
  chatId: string;
  senderId?: string;
  text: string;
  type: string;
  duration?: number;
}): Promise<ApiMessage> {
  const res = await fetch(MESSAGES_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = parse(await res.json()) as { message: ApiMessage };
  return data.message;
}

export async function markRead(chatId: string): Promise<void> {
  const token = getToken();
  const url = `${MESSAGES_URL}?action=read&chat_id=${encodeURIComponent(chatId)}${token ? `&token=${token}` : ''}`;
  await fetch(url, { method: 'PUT', headers: authHeaders() });
}

export async function uploadBackground(dataUrl: string): Promise<string> {
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  });
  const data = parse(await res.json()) as { url: string };
  return data.url;
}
