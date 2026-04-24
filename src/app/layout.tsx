import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'ALEX — LinkedIn Profile Auditor',
  description:
    'Get a ruthlessly honest score on your LinkedIn profile. Section-by-section breakdown with exact rewrites — powered by AI, trained on recruiter criteria.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} style={{ backgroundColor: '#09090b' }}>
      <body className="antialiased min-h-screen" style={{ backgroundColor: '#09090b' }}>
        {children}
      </body>
    </html>
  );
}
