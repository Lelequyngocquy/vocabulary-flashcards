'use client';

import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  isError?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, isError = false }) => {
  return (
    <div
      id="syncToast"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      <div
        className={`px-3.5 py-1.5 rounded-[6px] text-xs font-mono font-medium flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)] ${
          isError
            ? 'bg-[#1a1111] border border-red-500/80 text-red-200'
            : 'bg-canvas-soft border border-primary text-ink'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isError ? 'bg-red-500 animate-pulse' : 'bg-primary animate-pulse'
          }`}
        />
        <span id="syncToastText">{message || 'SYNC_OK'}</span>
      </div>
    </div>
  );
};
