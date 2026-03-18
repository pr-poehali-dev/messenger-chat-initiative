import React from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { notifications, users } from '@/data/mockData';

export default function NotificationsPanel() {
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const iconMap: Record<string, string> = {
    message: 'MessageCircle',
    call: 'Phone',
    contact: 'UserPlus',
  };

  const colorMap: Record<string, string> = {
    message: 'from-violet-500 to-pink-500',
    call: 'from-blue-500 to-violet-500',
    contact: 'from-emerald-500 to-cyan-500',
  };

  const renderNotif = (n: typeof notifications[0], idx: number) => {
    const user = users.find((u) => u.id === n.userId);
    const userIdx = users.findIndex((u) => u.id === n.userId);
    return (
      <div
        key={n.id}
        className={`flex items-center gap-3 p-3 rounded-2xl transition-all animate-fade-in ${
          !n.read ? 'bg-violet-500/8 border border-violet-500/15' : 'hover:bg-white/4 border border-transparent'
        }`}
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        <div className="relative">
          <Avatar initials={user?.avatar || '?'} size="md" index={userIdx} />
          <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${colorMap[n.type]} flex items-center justify-center`}>
            <Icon name={iconMap[n.type]} fallback="Bell" size={10} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90">
            <span className="font-medium">{user?.name}</span>{' '}
            <span className="text-white/50">{n.text}</span>
          </p>
          <p className="text-xs text-white/30 mt-0.5">{n.time}</p>
        </div>
        {!n.read && (
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Уведомления</h2>
          {unread.length > 0 && (
            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Прочитать все
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {unread.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Новые</span>
              <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white text-[9px] font-bold">
                {unread.length}
              </span>
            </div>
            <div className="space-y-1">
              {unread.map((n, i) => renderNotif(n, i))}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Ранее</span>
            </div>
            <div className="space-y-1">
              {read.map((n, i) => renderNotif(n, unread.length + i))}
            </div>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/30">
            <Icon name="BellOff" size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Нет уведомлений</p>
          </div>
        )}
      </div>
    </div>
  );
}
