import React from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { currentUser } from '@/data/mockData';

type Tab = 'chats' | 'contacts' | 'notifications' | 'profile';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  unreadChats: number;
  unreadNotifications: number;
}

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'chats', icon: 'MessageCircle', label: 'Чаты' },
  { id: 'contacts', icon: 'Users', label: 'Контакты' },
  { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
];

export default function Sidebar({ activeTab, onTabChange, unreadChats, unreadNotifications }: SidebarProps) {
  const badges: Partial<Record<Tab, number>> = {
    chats: unreadChats,
    notifications: unreadNotifications,
  };

  return (
    <div className="w-16 h-full flex flex-col items-center py-4 glass border-r border-white/5 z-10">
      <div className="mb-6 cursor-pointer" onClick={() => onTabChange('profile')}>
        <Avatar initials={currentUser.avatar} status="online" size="md" index={0} />
      </div>

      <div className="flex-1 flex flex-col gap-1 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = badges[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 group ${
                isActive
                  ? 'grad-bg shadow-lg glow-purple'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/8'
              }`}
              title={tab.label}
            >
              <Icon name={tab.icon} fallback="Circle" size={18} />
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-violet-500 to-pink-500 rounded-r-full -ml-2" />
              )}
            </button>
          );
        })}
      </div>

      <button className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
        <Icon name="LogOut" size={16} />
      </button>
    </div>
  );
}