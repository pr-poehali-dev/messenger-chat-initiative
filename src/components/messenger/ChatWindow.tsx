import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import Avatar from './Avatar';
import { chats, users } from '@/data/mockData';
import { fetchMessages, sendMessage as apiSendMessage, markRead } from '@/api/messenger';
import type { ApiMessage } from '@/api/messenger';

interface ChatWindowProps {
  chatId: string | null;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ApiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!chatId) return;
    setIsLoading(true);
    fetchMessages(chatId)
      .then((msgs) => {
        setChatMessages(msgs);
        markRead(chatId);
      })
      .finally(() => setIsLoading(false));
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } else {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
    return () => { if (recordIntervalRef.current) clearInterval(recordIntervalRef.current); };
  }, [isRecording]);

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="animate-float">
          <div className="w-24 h-24 rounded-3xl grad-bg flex items-center justify-center mb-6 shadow-2xl glow-purple">
            <Icon name="MessageCircle" size={40} className="text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Выберите чат</h3>
        <p className="text-white/40 text-sm">Начните переписку или выберите существующую</p>
      </div>
    );
  }

  const chat = chats.find((c) => c.id === chatId);
  const user = users.find((u) => u.id === chat?.userId);
  const userIdx = users.findIndex((u) => u.id === chat?.userId);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatId) return;
    const text = inputText.trim();
    setInputText('');
    const optimistic: ApiMessage = {
      id: `tmp-${Date.now()}`,
      chatId,
      senderId: 'me',
      text,
      type: 'text',
      duration: 0,
      read: false,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, optimistic]);
    try {
      const saved = await apiSendMessage({ chatId, senderId: 'me', text, type: 'text' });
      setChatMessages((prev) => prev.map((m) => m.id === optimistic.id ? saved : m));
    } catch {
      setChatMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInputText(text);
    }
  };

  const handleSendVoice = async () => {
    if (!chatId) return;
    const duration = recordSeconds;
    setIsRecording(false);
    const optimistic: ApiMessage = {
      id: `tmp-${Date.now()}`,
      chatId,
      senderId: 'me',
      text: 'Голосовое сообщение',
      type: 'voice',
      duration,
      read: false,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, optimistic]);
    try {
      const saved = await apiSendMessage({ chatId, senderId: 'me', text: 'Голосовое сообщение', type: 'voice', duration });
      setChatMessages((prev) => prev.map((m) => m.id === optimistic.id ? saved : m));
    } catch {
      setChatMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 glass-strong">
        <div className="flex items-center gap-3">
          <Avatar initials={user?.avatar || '?'} status={user?.status} size="md" index={userIdx} />
          <div>
            <h3 className="font-semibold text-white text-sm">{user?.name}</h3>
            <p className="text-xs text-white/40">
              {user?.status === 'online' ? (
                <span className="text-emerald-400">онлайн</span>
              ) : user?.lastSeen}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCallType('voice'); setShowCall(true); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Icon name="Phone" size={16} />
          </button>
          <button
            onClick={() => { setCallType('video'); setShowCall(true); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Icon name="Video" size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all">
            <Icon name="MoreVertical" size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 rounded-full border-2 border-violet-500/50 border-t-violet-500 animate-spin" />
          </div>
        )}
        {!isLoading && chatMessages.map((msg, i) => {
          const isMe = msg.senderId === 'me';
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              {!isMe && (
                <div className="mr-2 mt-1">
                  <Avatar initials={user?.avatar || '?'} size="sm" index={userIdx} />
                </div>
              )}
              <div className={`max-w-[70%] ${isMe ? 'msg-out' : 'msg-in'}`}>
                {msg.type === 'voice' ? (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-to-br from-violet-600 to-pink-600 rounded-br-sm'
                      : 'bg-white/8 border border-white/8 rounded-bl-sm'
                  }`}>
                    <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Icon name="Play" size={12} className="text-white" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-end gap-0.5 h-6">
                        {Array.from({ length: 24 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-0.5 bg-white/60 rounded-full"
                            style={{ height: `${(idx % 5) * 3 + 4}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-white/70">{formatDuration(msg.duration || 0)}</span>
                  </div>
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-gradient-to-br from-violet-600 to-pink-600 rounded-br-sm text-white'
                      : 'bg-white/8 border border-white/8 rounded-bl-sm text-white/90'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                )}
                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-[10px] text-white/30">{msg.time}</span>
                  {isMe && (
                    <Icon
                      name={msg.read ? 'CheckCheck' : 'Check'}
                      size={10}
                      className={msg.read ? 'text-violet-400' : 'text-white/30'}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5">
        {isRecording ? (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
            <span className="text-red-400 text-sm font-medium">Запись... {formatDuration(recordSeconds)}</span>
            <div className="flex-1" />
            <button onClick={() => setIsRecording(false)} className="text-white/40 hover:text-white/70 transition-colors">
              <Icon name="X" size={16} />
            </button>
            <button
              onClick={handleSendVoice}
              className="w-8 h-8 rounded-xl grad-bg flex items-center justify-center text-white shadow-lg"
            >
              <Icon name="Send" size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/8 transition-all">
              <Icon name="Paperclip" size={16} />
            </button>
            <div className="flex-1 relative">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Написать сообщение..."
                className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                <Icon name="Smile" size={16} />
              </button>
            </div>
            {inputText ? (
              <button
                onClick={handleSendMessage}
                className="w-9 h-9 rounded-xl grad-bg flex items-center justify-center text-white shadow-lg glow-purple hover:opacity-90 transition-opacity"
              >
                <Icon name="Send" size={14} />
              </button>
            ) : (
              <button
                onClick={() => setIsRecording(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all"
              >
                <Icon name="Mic" size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCall && user && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="glass-strong rounded-3xl p-8 flex flex-col items-center gap-6 w-72 animate-scale-in">
            <div className="relative">
              <Avatar initials={user.avatar} size="xl" index={userIdx} />
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/50 animate-ping" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-white/50 text-sm mt-1">
                {callType === 'video' ? 'Видеозвонок...' : 'Голосовой звонок...'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCall(false)}
                className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
              >
                <Icon name="PhoneOff" size={22} />
              </button>
              {callType === 'video' && (
                <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Icon name="VideoOff" size={20} />
                </button>
              )}
              <button className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Icon name="MicOff" size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
