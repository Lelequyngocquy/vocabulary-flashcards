'use client';

import React from 'react';
import { playTapSound } from '@/lib/audio';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSoundMuted: boolean;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  isSoundMuted,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="forgotPassModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-sm rounded-[8px] bg-canvas border border-hairline shadow-2xl p-6 text-center space-y-4">
        <div className="w-10 h-10 rounded-[6px] bg-canvas-soft border border-hairline text-primary mx-auto flex items-center justify-center text-lg font-mono">
          ?
        </div>
        <div>
          <h3 className="text-lg font-normal text-ink-strong tracking-tight">Account Recovery</h3>
          <p className="text-xs text-body mt-1 leading-relaxed">
            Contact administrator directly via hotline or Zalo to reset your credentials:
          </p>
        </div>

        <div className="p-3.5 rounded-[6px] bg-canvas-soft border border-hairline space-y-1">
          <div className="text-[10px] text-mute uppercase tracking-widest font-mono">
            DIRECT HOTLINE / ZALO
          </div>
          <div className="text-xl font-bold font-mono text-primary tracking-wider">
            0961684809
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <a
            href="tel:0961684809"
            onClick={() => playTapSound(isSoundMuted)}
            className="py-2 px-3 rounded-[6px] bg-primary text-primary-on font-semibold flex items-center justify-center gap-1 tap-bounce cursor-pointer"
          >
            <span>Call Admin</span>
          </a>
          <button
            onClick={() => {
              playTapSound(isSoundMuted);
              onClose();
            }}
            className="py-2 px-3 rounded-[6px] bg-canvas-soft hover:bg-canvas text-ink border border-hairline tap-bounce cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
