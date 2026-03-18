const CHATS_URL = 'https://functions.poehali.dev/145acb06-bce6-4b63-aa61-4d57b6bc4c67';
const MESSAGES_URL = 'https://functions.poehali.dev/276b388d-d419-4e14-9bb5-bb213221734f';

export interface ApiMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'voice';
  duration: number;
  read: boolean;
  time: string;
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
  const res = await fetch(CHATS_URL);
  const data = await res.json();
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return parsed;
}

export async function fetchMessages(chatId: string): Promise<ApiMessage[]> {
  const res = await fetch(`${MESSAGES_URL}?chat_id=${encodeURIComponent(chatId)}`);
  const data = await res.json();
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return parsed.messages || [];
}

export async function sendMessage(payload: {
  chatId: string;
  senderId: string;
  text: string;
  type: string;
  duration?: number;
}): Promise<ApiMessage> {
  const res = await fetch(MESSAGES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return parsed.message;
}

export async function markRead(chatId: string): Promise<void> {
  await fetch(`${MESSAGES_URL}?action=read&chat_id=${encodeURIComponent(chatId)}`, {
    method: 'PUT',
  });
}
