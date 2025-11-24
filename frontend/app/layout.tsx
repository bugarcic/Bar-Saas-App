import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bar Admission Wizard',
  description: 'Streamlined NY Bar admission workflow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

