'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const TABS = [
  { href: '/', label: 'امروز', d: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM8 3v4M16 3v4M3 10h18' },
  { href: '/stats', label: 'آمار', d: 'M5 20V10M12 20V4M19 20v-7' },
  { href: '/settings', label: 'تنظیمات', d: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6' },
];

export default function TabBar() {
  const path = usePathname();
  if (path === '/new') return null;
  return (
    <nav className="tabbar" aria-label="ناوبری اصلی">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className="tab" aria-current={path === t.href ? 'page' : undefined}>
          <Icon d={t.d} />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
