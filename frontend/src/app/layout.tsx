import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'ClientFlow — Proje Yönetimi',
  description: 'Müşteri ve proje yönetim paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body className="bg-surface-50 font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
