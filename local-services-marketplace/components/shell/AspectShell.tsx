import React from 'react';

interface AspectShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AspectShell({ children, className = '' }: AspectShellProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-0 sm:p-4">
      <div
        className={`relative w-full max-w-[430px] h-[100dvh] sm:h-auto sm:aspect-[9/16] overflow-y-auto bg-bg text-text shadow-2xl flex flex-col sm:rounded-3xl border-0 sm:border-8 border-slate-800 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

