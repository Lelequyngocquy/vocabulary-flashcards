'use client';

import React from 'react';
import { playTapSound } from '@/infrastructure/device/audioService';
import { useAuthStore } from '@/application/stores/useAuthStore';
import { useSettingsStore } from '@/application/stores/useSettingsStore';

export interface ForgotPasswordModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isSoundMuted?: boolean;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = (props) => {
  const storeIsOpen = useAuthStore((s) => s.forgotPassModalOpen);
  const storeClose = useAuthStore((s) => s.closeForgotPasswordModal);
  const storeIsMuted = useSettingsStore((s) => s.isSoundMuted);

  const isOpen = props.isOpen !== undefined ? props.isOpen : storeIsOpen;
  const onClose = props.onClose ?? storeClose;
  const isSoundMuted = props.isSoundMuted !== undefined ? props.isSoundMuted : storeIsMuted;

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
          <div className="text-[11px] text-mute font-mono">ADMIN / SUPPORT</div>
        </div>

        <button
          onClick={() => {
            playTapSound(isSoundMuted);
            onClose();
          }}
          className="w-full py-2.5 rounded-[6px] bg-canvas-soft hover:bg-canvas text-ink border border-hairline font-mono text-xs uppercase tracking-wider transition-all tap-bounce cursor-pointer"
        >
          [ Dismiss / Close ]
        </button>
      </div>
    </div>
  );
};
