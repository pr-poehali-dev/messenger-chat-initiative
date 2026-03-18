import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { fetchUsers, createChat } from '@/api/auth';
import { getToken } from '@/api/auth';
import type { AuthUser } from '@/api/auth';

interface ContactsPanelProps {
  onStartChat: (chatId: string) => void;
}

export default function ContactsPanel({ onStartChat }: ContactsPanelProps) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchUsers(token)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const handleStartChat = async (userId: string) => {
    const token = getToken();
    if (!token) return;
    setStartingChat(userId);
    try {
      const chatId = await createChat(token, userId);
      onStartChat(chatId);
    } finally {
      setStartingChat(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const online = filtered.filter((u) => u.status === 'online');
  const offline = filtered.filter((u) => u.status !== 'online');

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Контакты</h2>
          <span className="text-xs text-white/30">{users.length} пользователей</span>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
          </div>
        )}

        {!loading && online.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Онлайн — {online.length}</span>
            </div>
            <div className="space-y-1">
              {online.map((user, i) => (
                <ContactCard
                  key={user.id}
                  user={user}
                  index={i}
                  loading={startingChat === user.id}
                  onChat={() => handleStartChat(user.id)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && offline.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Оффлайн — {offline.length}</span>
            </div>
            <div className="space-y-1">
              {offline.map((user, i) => (
                <ContactCard
                  key={user.id}
                  user={user}
                  index={online.length + i}
                  loading={startingChat === user.id}
                  onChat={() => handleStartChat(user.id)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <Icon name="Users" size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Пользователи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({ user, index, onChat, loading }: {
  user: AuthUser;
  index: number;
  onChat: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/8">
      <Avatar initials={user.avatar} status={user.status as 'online' | 'offline' | 'away'} size="md" index={index} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{user.name}</p>
        <p className="text-xs text-white/40 truncate">{user.bio || user.phone}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onChat}
          disabled={loading}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-violet-500/20 transition-all disabled:opacity-50"
          title="Написать"
        >
          {loading
            ? <div className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
            : <Icon name="MessageCircle" size={14} />
          }
        </button>
      </div>
    </div>
  );
}
