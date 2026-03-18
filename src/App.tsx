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
import AuthScreen from './components/messenger/AuthScreen';
import { fetchChats } from './api/messenger';
import { getToken, getStoredUser, saveSession, clearSession, logout, getMe } from './api/auth';
import type { AuthUser } from './api/auth';
import { notifications } from './data/mockData';

type Tab = 'chats' | 'contacts' | 'notifications' | 'profile';
const LS_APP_BG = 'messenger_app_bg';
const LS_CHAT_BG = 'messenger_chat_bg';

const MessengerApp = ({ currentUser, onLogout }: { currentUser: AuthUser; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<Tab>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [appBg, setAppBg] = useState<string>(() => localStorage.getItem(LS_APP_BG) || '');
  const [chatBg, setChatBg] = useState<string>(() => localStorage.getItem(LS_CHAT_BG) || '');

  useEffect(() => {
    fetchChats().then(({ chats }) => {
      setUnreadChats(chats.reduce((sum, c) => sum + c.unread, 0));
      if (!activeChatId && chats.length > 0) setActiveChatId(chats[0].id);
    });
  }, []);

  const handleAppBgChange = (url: string) => {
    setAppBg(url);
    if (url) localStorage.setItem(LS_APP_BG, url); else localStorage.removeItem(LS_APP_BG);
  };

  const handleChatBgChange = (url: string) => {
    setChatBg(url);
    if (url) localStorage.setItem(LS_CHAT_BG, url); else localStorage.removeItem(LS_CHAT_BG);
  };

  const handleStartChatFromContact = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveTab('chats');
  };

  const handleLogout = async () => {
    const token = getToken();
    if (token) await logout(token);
    clearSession();
    onLogout();
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="h-screen w-screen flex overflow-hidden"
      style={appBg
        ? { backgroundImage: `url(${appBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #030308 100%)' }
      }
    >
      {appBg && <div className="fixed inset-0 bg-black/50 pointer-events-none" />}
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
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'chats' && (
          <>
            <ChatList activeChatId={activeChatId} onChatSelect={setActiveChatId} />
            <ChatWindow chatId={activeChatId} chatBg={chatBg} currentUserId={currentUser.id} />
          </>
        )}
        {activeTab === 'contacts' && (
          <ContactsPanel onStartChat={handleStartChatFromContact} />
        )}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'profile' && (
          <ProfilePanel
            currentUser={currentUser}
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

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (!token) { setChecking(false); return; }
    if (stored) { setUser(stored); setChecking(false); return; }
    getMe(token).then((u) => {
      if (u) setUser(u);
      else clearSession();
    }).finally(() => setChecking(false));
  }, []);

  const handleAuth = (token: string, authUser: AuthUser) => {
    saveSession(token, authUser);
    setUser(authUser);
  };

  if (checking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#030308' }}>
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {user
        ? <MessengerApp currentUser={user} onLogout={() => setUser(null)} />
        : <AuthScreen onAuth={handleAuth} />
      }
    </TooltipProvider>
  );
};

export default App;
