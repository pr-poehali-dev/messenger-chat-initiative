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

const MessengerApp = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>('c1');
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    fetchChats().then(({ chats }) => {
      setUnreadChats(chats.reduce((sum, c) => sum + c.unread, 0));
    });
  }, []);

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
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #030308 100%)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-pink-600/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

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
            <ChatWindow chatId={activeChatId} />
          </>
        )}
        {activeTab === 'contacts' && (
          <ContactsPanel onStartChat={handleStartChatFromContact} />
        )}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'profile' && <ProfilePanel />}
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