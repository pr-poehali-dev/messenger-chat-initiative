import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { users } from '@/data/mockData';

interface ContactsPanelProps {
  onStartChat: (userId: string) => void;
}

export default function ContactsPanel({ onStartChat }: ContactsPanelProps) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState('');

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const online = filtered.filter((u) => u.status === 'online');
  const offline = filtered.filter((u) => u.status !== 'online');

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Контакты</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl grad-bg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            <Icon name="UserPlus" size={14} />
            Добавить
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск контактов..."
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {online.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Онлайн — {online.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {online.map((user, i) => (
                <ContactCard key={user.id} user={user} index={i} onChat={() => onStartChat(user.id)} />
              ))}
            </div>
          </div>
        )}

        {offline.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Оффлайн — {offline.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {offline.map((user, i) => (
                <ContactCard key={user.id} user={user} index={online.length + i} onChat={() => onStartChat(user.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-3xl p-6 w-80 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Новый контакт</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Имя пользователя или телефон"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <input
                placeholder="Имя (необязательно)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <button
                onClick={() => setShowAdd(false)}
                className="w-full py-2.5 rounded-xl grad-bg text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
              >
                Добавить контакт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactCard({ user, index, onChat }: { user: typeof users[0]; index: number; onChat: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/8">
      <Avatar initials={user.avatar} status={user.status} size="md" index={index} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 truncate">{user.name}</p>
        <p className="text-xs text-white/40 truncate">{user.bio}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onChat}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-violet-500/20 transition-all"
          title="Написать"
        >
          <Icon name="MessageCircle" size={14} />
        </button>
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-blue-500/20 transition-all"
          title="Позвонить"
        >
          <Icon name="Phone" size={14} />
        </button>
      </div>
    </div>
  );
}
