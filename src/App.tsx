import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from './components/messenger/Sidebar';
import ChatList from './components/messenger/ChatList';
import ChatWindow from './components/messenger/ChatWindow';
import ContactsPanel from './components/messenger/ContactsPanel';
import NotificationsPanel from './components/messenger/NotificationsPanel';
import ProfilePanel from './components/messenger/ProfilePanel';
import { fetchChats } from './api/messenger';
import { notifications } from './data/mockData';

type Tab = 'chats' | 'contacts' | 'notifications' | 'profile';

const LS_APP_BG = 'messenger_app_bg';
const LS_CHAT_BG = 'messenger_chat_bg';

const MessengerApp = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>('c1');
  const [unreadChats, setUnreadChats] = useState(0);
  const [appBg, setAppBg] = useState<string>(() => localStorage.getItem(LS_APP_BG) || '');
  const [chatBg, setChatBg] = useState<string>(() => localStorage.getItem(LS_CHAT_BG) || '');

  useEffect(() => {
    fetchChats().then(({ chats }) => {
      setUnreadChats(chats.reduce((sum, c) => sum + c.unread, 0));
    });
  }, []);

  const handleAppBgChange = (url: string) => {
    setAppBg(url);
    if (url) localStorage.setItem(LS_APP_BG, url);
    else localStorage.removeItem(LS_APP_BG);
  };

  const handleChatBgChange = (url: string) => {
    setChatBg(url);
    if (url) localStorage.setItem(LS_CHAT_BG, url);
    else localStorage.removeItem(LS_CHAT_BG);
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleStartChatFromContact = (userId: string) => {
    fetchChats().then(({ chats }) => {
      const chat = chats.find((c) => c.userId === userId);
      if (chat) {
        setActiveChatId(chat.id);
        setActiveTab('chats');
      }
    });
  };

  return (
    <div
      className="h-screen w-screen flex overflow-hidden"
      style={appBg
        ? { backgroundImage: `url(${appBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #030308 100%)' }
      }
    >
      {appBg && <div className="fixed inset-0 bg-black/50 pointer-events-none" />}

      {/* Background orbs (only without custom bg) */}
      {!appBg && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-48 w-96 h-96 bg-pink-600/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadChats={unreadChats}
        unreadNotifications={unreadNotifications}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'chats' && (
          <>
            <ChatList activeChatId={activeChatId} onChatSelect={setActiveChatId} />
            <ChatWindow chatId={activeChatId} chatBg={chatBg} />
          </>
        )}
        {activeTab === 'contacts' && (
          <ContactsPanel onStartChat={handleStartChatFromContact} />
        )}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'profile' && (
          <ProfilePanel
            appBg={appBg}
            chatBg={chatBg}
            onAppBgChange={handleAppBgChange}
            onChatBgChange={handleChatBgChange}
          />
        )}
      </div>
    </div>
  );
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <MessengerApp />
  </TooltipProvider>
);

export default App;
