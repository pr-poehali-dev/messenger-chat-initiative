import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { fetchChats } from '@/api/messenger';
import type { ApiChat, ApiUser } from '@/api/messenger';

interface ChatListProps {
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

const gradientIndexMap: Record<string, number> = {
  u1: 0, u2: 1, u3: 2, u4: 3, u5: 4, u6: 5, u7: 6, u8: 7,
};

export default function ChatList({ activeChatId, onChatSelect }: ChatListProps) {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [users, setUsers] = useState<Record<string, ApiUser>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats()
      .then(({ chats: c, users: u }) => {
        setChats(c);
        setUsers(u);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = chats.filter((chat) => {
    const user = users[chat.userId];
    return user?.name.toLowerCase().includes(search.toLowerCase());
  });

  const renderChat = (chat: ApiChat) => {
    const user = users[chat.userId];
    if (!user) return null;
    const isActive = activeChatId === chat.id;
    const isVoice = chat.lastMessage === 'Голосовое сообщение';
    const idx = gradientIndexMap[chat.userId] ?? 0;

    return (
      <button
        key={chat.id}
        onClick={() => onChatSelect(chat.id)}
        className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left group ${
          isActive
            ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/10 border border-violet-500/20'
            : 'hover:bg-white/5 border border-transparent'
        }`}
      >
        <Avatar initials={user.avatar} status={user.status} size="md" index={idx} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-white/90'}`}>
              {user.name}
            </span>
            <span className="text-[10px] text-white/40 flex-shrink-0 ml-2">{chat.lastTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 truncate flex items-center gap-1">
              {isVoice && <Icon name="Mic" size={10} />}
              {chat.lastMessage}
            </span>
            {chat.unread > 0 && (
              <span className="ml-2 flex-shrink-0 w-4 h-4 min-w-[1rem] bg-gradient-to-br from-violet-500 to-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-72 h-full flex flex-col border-r border-white/5">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Сообщения</h2>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center grad-bg text-white shadow-lg hover:opacity-90 transition-opacity">
            <Icon name="Plus" size={14} />
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск чатов..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {isLoading && (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Все чаты</span>
            </div>
            {filtered.map((chat) => renderChat(chat))}
          </>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <Icon name="Search" size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}
