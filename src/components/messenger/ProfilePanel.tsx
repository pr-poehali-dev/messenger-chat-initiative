import React, { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { currentUser } from '@/data/mockData';
import { uploadBackground } from '@/api/messenger';

interface ProfilePanelProps {
  appBg: string;
  chatBg: string;
  onAppBgChange: (url: string) => void;
  onChatBgChange: (url: string) => void;
}

type Section = 'profile' | 'appearance' | 'notifications';

export default function ProfilePanel({ appBg, chatBg, onAppBgChange, onChatBgChange }: ProfilePanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [theme, setTheme] = useState('purple');
  const [uploadingApp, setUploadingApp] = useState(false);
  const [uploadingChat, setUploadingChat] = useState(false);
  const appBgInputRef = useRef<HTMLInputElement>(null);
  const chatBgInputRef = useRef<HTMLInputElement>(null);

  const themes = [
    { id: 'purple', label: 'Фиолетовый', from: 'from-violet-500', to: 'to-pink-500' },
    { id: 'blue', label: 'Синий', from: 'from-blue-500', to: 'to-cyan-500' },
    { id: 'green', label: 'Зелёный', from: 'from-emerald-500', to: 'to-teal-500' },
    { id: 'orange', label: 'Оранжевый', from: 'from-orange-500', to: 'to-pink-500' },
  ];

  const handleFileUpload = async (file: File, type: 'app' | 'chat') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'app') {
        setUploadingApp(true);
        try {
          const url = await uploadBackground(dataUrl);
          onAppBgChange(url);
        } finally {
          setUploadingApp(false);
        }
      } else {
        setUploadingChat(true);
        try {
          const url = await uploadBackground(dataUrl);
          onChatBgChange(url);
        } finally {
          setUploadingChat(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const sections: { id: Section; icon: string; label: string }[] = [
    { id: 'profile', icon: 'User', label: 'Профиль' },
    { id: 'appearance', icon: 'Palette', label: 'Оформление' },
    { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Cover */}
      <div
        className="relative h-32 flex-shrink-0"
        style={appBg
          ? { backgroundImage: `url(${appBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #7C3AED, #DB2777, #3B82F6)' }
        }
      >
        {appBg && <div className="absolute inset-0 bg-black/30" />}
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
          {activeSection === 'profile' && (
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
          )}
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 glass rounded-2xl border border-white/8 mb-6">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeSection === s.id
                  ? 'grad-bg text-white shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon name={s.icon} fallback="Circle" size={12} />
              {s.label}
            </button>
          ))}
        </div>

        {/* PROFILE SECTION */}
        {activeSection === 'profile' && (
          <div className="animate-fade-in space-y-5">
            {editing ? (
              <div className="space-y-3">
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
              <div>
                <h2 className="text-xl font-bold text-white">{name}</h2>
                <p className="text-sm text-white/50 mt-1">{bio}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Icon name="Phone" size={12} className="text-white/30" />
                  <span className="text-xs text-white/40">{currentUser.phone}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Чатов', value: '8' }, { label: 'Контактов', value: '8' }, { label: 'Медиа', value: '24' }].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-3 text-center border border-white/5">
                  <p className="text-lg font-bold grad-text">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

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
        )}

        {/* APPEARANCE SECTION */}
        {activeSection === 'appearance' && (
          <div className="animate-fade-in space-y-6">

            {/* App background */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Monitor" size={14} className="text-violet-400" />
                <p className="text-sm font-medium text-white">Фон приложения</p>
              </div>
              <div
                className="relative w-full h-28 rounded-2xl overflow-hidden mb-3 border border-white/10 cursor-pointer group"
                onClick={() => appBgInputRef.current?.click()}
                style={appBg
                  ? { backgroundImage: `url(${appBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #1a0a2e, #0a0a14)' }
                }
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  {uploadingApp ? (
                    <div className="w-6 h-6 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/80 group-hover:text-white transition-colors">
                      <Icon name="Upload" size={20} />
                      <span className="text-xs">{appBg ? 'Сменить фото' : 'Загрузить фото'}</span>
                    </div>
                  )}
                </div>
                {appBg && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAppBgChange(''); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <Icon name="X" size={10} />
                  </button>
                )}
              </div>
              <input
                ref={appBgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'app');
                }}
              />
            </div>

            {/* Chat background */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="MessageCircle" size={14} className="text-pink-400" />
                <p className="text-sm font-medium text-white">Фон чатов</p>
              </div>
              <div
                className="relative w-full h-28 rounded-2xl overflow-hidden mb-3 border border-white/10 cursor-pointer group"
                onClick={() => chatBgInputRef.current?.click()}
                style={chatBg
                  ? { backgroundImage: `url(${chatBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #0d0b1a, #1e1b4b)' }
                }
              >
                {chatBg && <div className="absolute inset-0 bg-black/30" />}
                <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  {uploadingChat ? (
                    <div className="w-6 h-6 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white/80 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="Upload" size={20} />
                      <span className="text-xs">{chatBg ? 'Сменить фото' : 'Загрузить фото'}</span>
                    </div>
                  )}
                </div>
                {/* Chat preview bubbles */}
                {!uploadingChat && (
                  <div className="absolute inset-0 flex flex-col justify-end p-3 gap-1 pointer-events-none">
                    <div className="self-start bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[60%]">
                      <span className="text-xs text-white/80">Привет! 👋</span>
                    </div>
                    <div className="self-end bg-gradient-to-br from-violet-600/80 to-pink-600/80 backdrop-blur-sm rounded-2xl rounded-br-sm px-3 py-1.5 max-w-[60%]">
                      <span className="text-xs text-white">Привет!</span>
                    </div>
                  </div>
                )}
                {chatBg && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onChatBgChange(''); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600 transition-colors z-10"
                  >
                    <Icon name="X" size={10} />
                  </button>
                )}
              </div>
              <input
                ref={chatBgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'chat');
                }}
              />
            </div>

            {/* Color theme */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Sparkles" size={14} className="text-blue-400" />
                <p className="text-sm font-medium text-white">Цветовая схема</p>
              </div>
              <div className="flex gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${t.from} ${t.to} transition-all ${
                      theme === t.id
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[hsl(var(--background))] scale-110'
                        : 'opacity-60 hover:opacity-90 hover:scale-105'
                    }`}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS SECTION */}
        {activeSection === 'notifications' && (
          <div className="animate-fade-in space-y-2">
            <SettingRow icon="Bell" label="Уведомления" value={notifications} onToggle={() => setNotifications(!notifications)} />
            <SettingRow icon="Volume2" label="Звуки" value={sounds} onToggle={() => setSounds(!sounds)} />
            <SettingRow icon="MessageSquare" label="Уведомления сообщений" value={true} onToggle={() => {}} />
            <SettingRow icon="Phone" label="Звонки" value={true} onToggle={() => {}} />
          </div>
        )}
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
        className={`w-10 rounded-full transition-all duration-300 relative ${
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
