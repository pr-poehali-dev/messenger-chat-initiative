import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { currentUser } from '@/data/mockData';

export default function ProfilePanel() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [theme, setTheme] = useState('purple');

  const themes = [
    { id: 'purple', label: 'Фиолетовый', from: 'from-violet-500', to: 'to-pink-500' },
    { id: 'blue', label: 'Синий', from: 'from-blue-500', to: 'to-cyan-500' },
    { id: 'green', label: 'Зелёный', from: 'from-emerald-500', to: 'to-teal-500' },
    { id: 'orange', label: 'Оранжевый', from: 'from-orange-500', to: 'to-pink-500' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header / Cover */}
      <div className="relative h-32 bg-gradient-to-br from-violet-600 via-pink-500 to-blue-600 flex-shrink-0">
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(var(--background))]" />
      </div>

      <div className="px-5 -mt-8 pb-6">
        <div className="flex items-end justify-between mb-5">
          <div className="relative">
            <Avatar initials={currentUser.avatar} size="xl" index={0} />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full grad-bg flex items-center justify-center text-white shadow-lg">
              <Icon name="Camera" size={12} />
            </button>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              editing
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'glass border border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Icon name={editing ? 'Check' : 'Pencil'} size={14} />
            {editing ? 'Сохранить' : 'Изменить'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3 mb-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors font-medium"
              placeholder="Ваше имя"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
              placeholder="О себе..."
            />
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="text-sm text-white/50 mt-1">{bio}</p>
            <div className="flex items-center gap-2 mt-3">
              <Icon name="Phone" size={12} className="text-white/30" />
              <span className="text-xs text-white/40">{currentUser.phone}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Чатов', value: '8' },
            { label: 'Контактов', value: '8' },
            { label: 'Медиа', value: '24' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-3 text-center border border-white/5">
              <p className="text-lg font-bold grad-text">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Настройки</h3>

          <div className="space-y-2">
            <SettingRow
              icon="Bell"
              label="Уведомления"
              value={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
            <SettingRow
              icon="Volume2"
              label="Звуки"
              value={sounds}
              onToggle={() => setSounds(!sounds)}
            />
          </div>

          <div>
            <p className="text-xs text-white/40 mb-3">Цветовая схема</p>
            <div className="flex gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.from} ${t.to} transition-all ${
                    theme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--background))] scale-110' : 'opacity-60 hover:opacity-90'
                  }`}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-2">
            {[
              { icon: 'Shield', label: 'Приватность и безопасность' },
              { icon: 'HelpCircle', label: 'Помощь и поддержка' },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center">
                  <Icon name={item.icon} fallback="Settings" size={14} className="text-white/50" />
                </div>
                <span className="text-sm text-white/70">{item.label}</span>
                <Icon name="ChevronRight" size={14} className="text-white/20 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value, onToggle }: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/4 transition-all">
      <div className="w-8 h-8 rounded-xl glass border border-white/8 flex items-center justify-center">
        <Icon name={icon} fallback="Settings" size={14} className="text-white/50" />
      </div>
      <span className="text-sm text-white/70 flex-1">{label}</span>
      <button
        onClick={onToggle}
        className={`w-10 h-5.5 rounded-full transition-all duration-300 relative ${
          value ? 'bg-gradient-to-r from-violet-500 to-pink-500' : 'bg-white/15'
        }`}
        style={{ height: '22px' }}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
          value ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}
