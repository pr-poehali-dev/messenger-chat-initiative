import React, { useState } from 'react';
import Icon from '@/components/ui/icon';
import { login, register } from '@/api/auth';
import type { AuthUser } from '@/api/auth';

interface AuthScreenProps {
  onAuth: (token: string, user: AuthUser) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await login(phone, password);
      } else {
        if (!name.trim()) { setError('Введите имя'); setLoading(false); return; }
        result = await register(name.trim(), phone, password);
      }
      onAuth(result.token, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top left, #1a0a2e 0%, #0a0a14 40%, #030308 100%)' }}>

      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-4 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl grad-bg flex items-center justify-center mb-4 shadow-2xl glow-purple">
            <Icon name="MessageCircle" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white font-golos">Мессенджер</h1>
          <p className="text-white/40 text-sm mt-1">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === m ? 'grad-bg text-white shadow-md' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-in">
                <label className="text-xs text-white/40 mb-1.5 block">Ваше имя</label>
                <div className="relative">
                  <Icon name="User" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя Фамилия"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Номер телефона</label>
              <div className="relative">
                <Icon name="Phone" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 000 00 00"
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Пароль</label>
              <div className="relative">
                <Icon name="Lock" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Придумайте пароль' : 'Введите пароль'}
                  type={showPass ? 'text' : 'password'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
                <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl grad-bg text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg glow-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} size={16} />
                  {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Ваши данные надёжно защищены
        </p>
      </div>
    </div>
  );
}
