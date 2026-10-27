'use client';

import React, { useState } from 'react';
import { playTapSound, playChimeSound, playErrorSound } from '@/lib/audio';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string | null;
  isSoundMuted: boolean;
  onSuccess: (message: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  authToken,
  isSoundMuted,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      playErrorSound(isSoundMuted);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      playErrorSound(isSoundMuted);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      playErrorSound(isSoundMuted);
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password must differ from current password.');
      playErrorSound(isSoundMuted);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || ''}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        playChimeSound(isSoundMuted);
        onSuccess(data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        setErrorMsg(data.error || 'Password update failed.');
        playErrorSound(isSoundMuted);
      }
    } catch {
      setErrorMsg('Server connection error. Please try again.');
      playErrorSound(isSoundMuted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="changePasswordModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm rounded-[8px] bg-canvas border border-hairline shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 space-y-4">
        {/* Close button */}
        <button
          onClick={() => {
            playTapSound(isSoundMuted);
            setErrorMsg('');
            onClose();
          }}
          className="absolute top-4 right-4 text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-[11px] mb-2">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <span>SECURITY_UPDATE</span>
          </div>
          <h2 className="text-xl font-medium text-ink-strong tracking-tight font-sans">
            Change Password
          </h2>
          <p className="text-xs text-body mt-0.5 font-sans">
            Update your account security credentials.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 rounded-[6px] bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2">
            <span className="text-sm leading-none mt-0.5">!</span>
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-mono">
          <div>
            <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">
              CURRENT PASSWORD
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-canvas-soft text-ink text-xs rounded-[6px] border border-hairline px-3 py-2.5 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">
              NEW PASSWORD (MIN 6 CHARACTERS)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-canvas-soft text-ink text-xs rounded-[6px] border border-hairline px-3 py-2.5 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-mute uppercase tracking-widest block mb-1">
              CONFIRM NEW PASSWORD
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-canvas-soft text-ink text-xs rounded-[6px] border border-hairline px-3 py-2.5 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Toggle show/hide password checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="showPassToggle"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded bg-canvas border-hairline text-primary focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="showPassToggle"
              className="text-[11px] text-mute select-none cursor-pointer"
            >
              Show passwords
            </label>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTapSound(isSoundMuted);
                setErrorMsg('');
                onClose();
              }}
              className="flex-1 py-2.5 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-mute hover:text-ink text-xs font-semibold tap-bounce transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs tracking-wider tap-bounce transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'UPDATING...' : 'CONFIRM UPDATE ➔'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
