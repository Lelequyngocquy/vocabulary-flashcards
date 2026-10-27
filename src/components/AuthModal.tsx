'use client';

import React, { useState } from 'react';
import { playTapSound, playChimeSound, playErrorSound } from '@/lib/audio';
import { UserProgress } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForgotPass: () => void;
  isSoundMuted: boolean;
  onAuthSuccess: (token: string, username: string, progress?: UserProgress) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenForgotPass,
  isSoundMuted,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        playChimeSound(isSoundMuted);
        onAuthSuccess(data.token, data.username, data.progress);
        onClose();
      } else {
        setErrorMsg(data.error || 'Authentication failed.');
        playErrorSound(isSoundMuted);
      }
    } catch {
      setErrorMsg('Server unreachable. Check connection.');
      playErrorSound(isSoundMuted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="authModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm rounded-[8px] bg-canvas border border-hairline shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 space-y-4">
        <button
          onClick={() => {
            playTapSound(isSoundMuted);
            onClose();
          }}
          className="absolute top-4 right-4 text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-[11px] mb-2">
            <span>⚡</span> VOLTAGENT AUTH
          </div>
          <h3 id="authModalTitle" className="text-xl font-normal text-ink-strong tracking-tight">
            {mode === 'login' ? 'Sign in to workspace' : 'Create user credential'}
          </h3>
          <p className="text-xs text-body mt-1">
            Persistent user storage across devices via SQLite database.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-0.5 bg-canvas-soft rounded-[6px] border border-hairline text-xs font-medium">
          <button
            id="tabAuthLogin"
            type="button"
            onClick={() => {
              playTapSound(isSoundMuted);
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-1.5 rounded-[4px] transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-primary text-primary-on font-semibold'
                : 'text-body hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            id="tabAuthRegister"
            type="button"
            onClick={() => {
              playTapSound(isSoundMuted);
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-1.5 rounded-[4px] transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-primary text-primary-on font-semibold'
                : 'text-body hover:text-ink'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div
            id="authErrorBox"
            className="p-2.5 rounded-[6px] bg-canvas-soft border border-rose-500/50 text-rose-300 text-xs font-mono"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-mono text-mute block mb-1 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              id="authUsername"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="developer_id"
              className="w-full bg-canvas-soft text-ink text-xs sm:text-sm rounded-[6px] border border-hairline px-3 py-2 focus:outline-none focus:border-primary transition-all font-mono placeholder:text-mute/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-mute block mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              id="authPassword"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-canvas-soft text-ink text-xs sm:text-sm rounded-[6px] border border-hairline px-3 py-2 focus:outline-none focus:border-primary transition-all font-mono placeholder:text-mute/60"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-mute text-[11px] font-mono">256-bit SSL</span>
            <button
              type="button"
              onClick={() => {
                playTapSound(isSoundMuted);
                onOpenForgotPass();
              }}
              className="text-primary hover:underline text-xs font-mono cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            id="authSubmitBtn"
            disabled={loading}
            className={`w-full py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm transition-all tap-bounce font-mono uppercase tracking-wider cursor-pointer ${
              loading ? 'opacity-70' : ''
            }`}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In ➔' : 'Register & Launch ➔'}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-hairline">
          <button
            type="button"
            onClick={() => {
              playTapSound(isSoundMuted);
              onClose();
            }}
            className="text-xs text-mute hover:text-ink transition-colors font-mono cursor-pointer"
          >
            [ Continue as guest ]
          </button>
        </div>
      </div>
    </div>
  );
};
