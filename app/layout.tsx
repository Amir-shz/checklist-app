import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import TabBar from '@/components/TabBar';
import './globals.css';

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'], display: 'swap' });

export const metadata: Metadata = { title: 'چک‌لیست روزانه', description: 'مدیریت کارهای روزانه، ذخیره‌شده در مرورگر شما' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0F766E' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazir.className}>
        <div className="shell">
          <main className="main">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
