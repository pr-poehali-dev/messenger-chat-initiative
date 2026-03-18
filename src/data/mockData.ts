export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  bio?: string;
  phone?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  time: string;
  type: 'text' | 'voice' | 'image';
  duration?: number;
  read: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  time: string;
  read: boolean;
  type: 'message' | 'call' | 'contact';
}

export const currentUser: User = {
  id: 'me',
  name: 'Александр Петров',
  avatar: 'АП',
  status: 'online',
  bio: 'Разработчик | Фотограф | Путешественник 🌍',
  phone: '+7 (999) 123-45-67',
};

export const users: User[] = [
  { id: 'u1', name: 'Мария Соколова', avatar: 'МС', status: 'online', bio: 'Дизайнер интерфейсов', lastSeen: 'онлайн' },
  { id: 'u2', name: 'Дмитрий Козлов', avatar: 'ДК', status: 'offline', bio: 'Продуктовый менеджер', lastSeen: '1 ч назад' },
  { id: 'u3', name: 'Анна Новикова', avatar: 'АН', status: 'online', bio: 'Маркетолог | Блогер', lastSeen: 'онлайн' },
  { id: 'u4', name: 'Сергей Волков', avatar: 'СВ', status: 'away', bio: 'Backend разработчик', lastSeen: '30 мин назад' },
  { id: 'u5', name: 'Екатерина Лебедева', avatar: 'ЕЛ', status: 'online', bio: 'Финансовый аналитик', lastSeen: 'онлайн' },
  { id: 'u6', name: 'Павел Морозов', avatar: 'ПМ', status: 'offline', bio: 'Фотограф', lastSeen: '3 ч назад' },
  { id: 'u7', name: 'Ольга Федорова', avatar: 'ОФ', status: 'online', bio: 'UX исследователь', lastSeen: 'онлайн' },
  { id: 'u8', name: 'Игорь Смирнов', avatar: 'ИС', status: 'offline', bio: 'DevOps инженер', lastSeen: 'вчера' },
];

export const chats: Chat[] = [
  { id: 'c1', userId: 'u1', lastMessage: 'Отлично, завтра созвонимся! 🎉', lastTime: '14:32', unread: 3, pinned: true },
  { id: 'c2', userId: 'u3', lastMessage: 'Видел новый проект? Очень круто получилось', lastTime: '13:15', unread: 1 },
  { id: 'c3', userId: 'u5', lastMessage: 'Отчёт готов, отправила на почту', lastTime: '12:07', unread: 0 },
  { id: 'c4', userId: 'u2', lastMessage: 'Голосовое сообщение', lastTime: '11:45', unread: 0 },
  { id: 'c5', userId: 'u4', lastMessage: 'Деплой прошёл успешно 🚀', lastTime: 'Вчера', unread: 0 },
  { id: 'c6', userId: 'u7', lastMessage: 'Результаты исследования очень интересные', lastTime: 'Вчера', unread: 2 },
  { id: 'c7', userId: 'u6', lastMessage: '📷 Фотография', lastTime: 'Пн', unread: 0 },
  { id: 'c8', userId: 'u8', lastMessage: 'Настроил мониторинг, всё работает', lastTime: 'Вс', unread: 0 },
];

export const messages: Record<string, Message[]> = {
  c1: [
    { id: 'm1', chatId: 'c1', senderId: 'u1', text: 'Привет! Как дела с проектом? 👋', time: '14:10', type: 'text', read: true },
    { id: 'm2', chatId: 'c1', senderId: 'me', text: 'Отлично продвигается! Почти закончил основной функционал', time: '14:15', type: 'text', read: true },
    { id: 'm3', chatId: 'c1', senderId: 'u1', text: 'Классно! Покажешь на встрече?', time: '14:20', type: 'text', read: true },
    { id: 'm4', chatId: 'c1', senderId: 'me', text: 'Конечно, подготовлю демо 💪', time: '14:25', type: 'text', read: true },
    { id: 'm5', chatId: 'c1', senderId: 'u1', text: 'Отлично, завтра созвонимся! 🎉', time: '14:32', type: 'text', read: false },
  ],
  c2: [
    { id: 'm1', chatId: 'c2', senderId: 'u3', text: 'Привет! Видел новый дизайн Notion?', time: '12:00', type: 'text', read: true },
    { id: 'm2', chatId: 'c2', senderId: 'me', text: 'Да, выглядит свежо', time: '12:30', type: 'text', read: true },
    { id: 'm3', chatId: 'c2', senderId: 'u3', text: 'Видел новый проект? Очень круто получилось', time: '13:15', type: 'text', read: false },
  ],
  c3: [
    { id: 'm1', chatId: 'c3', senderId: 'u5', text: 'Добрый день! Квартальный отчёт готов', time: '11:00', type: 'text', read: true },
    { id: 'm2', chatId: 'c3', senderId: 'me', text: 'Спасибо! Посмотрю сегодня', time: '11:45', type: 'text', read: true },
    { id: 'm3', chatId: 'c3', senderId: 'u5', text: 'Отчёт готов, отправила на почту', time: '12:07', type: 'text', read: true },
  ],
  c4: [
    { id: 'm1', chatId: 'c4', senderId: 'u2', text: 'Нужно обсудить roadmap', time: '11:00', type: 'text', read: true },
    { id: 'm2', chatId: 'c4', senderId: 'u2', text: 'Голосовое сообщение', time: '11:45', type: 'voice', duration: 32, read: true },
  ],
};

export const notifications: Notification[] = [
  { id: 'n1', userId: 'u1', text: 'отправила вам сообщение', time: '14:32', read: false, type: 'message' },
  { id: 'n2', userId: 'u3', text: 'написала в чат', time: '13:15', read: false, type: 'message' },
  { id: 'n3', userId: 'u7', text: 'оставила 2 сообщения', time: 'Вчера', read: false, type: 'message' },
  { id: 'n4', userId: 'u2', text: 'звонил вам', time: 'Вчера', read: true, type: 'call' },
  { id: 'n5', userId: 'u4', text: 'добавлен в контакты', time: 'Пн', read: true, type: 'contact' },
];
