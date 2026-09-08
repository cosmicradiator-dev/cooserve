import React from 'react';

interface AspectShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AspectShell({ children, className = '' }: AspectShellProps) {
  return (
    <div className={`min-h-screen w-full flex flex-col bg-bg text-text transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}
