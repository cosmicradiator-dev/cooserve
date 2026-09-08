import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AspectShell } from '@/components/shell/AspectShell';

export const metadata: Metadata = {
  title: 'Cooperative Gig Services Platform',
  description: 'Fair, transparent, cooperative gig marketplace for community services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <AspectShell>
          {children}
        </AspectShell>
      </body>
    </html>
  );
}

