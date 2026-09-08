import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AspectShell } from '@/components/shell/AspectShell';

export const metadata: Metadata = {
  title: 'Cooperative Gig Services Platform',
  description: 'Fair, transparent, cooperative gig marketplace for community services',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F766E',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg text-text">
        <AspectShell>
          {children}
        </AspectShell>
      </body>
    </html>
  );
}
