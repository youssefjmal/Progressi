'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Apple, BarChart2, TrendingUp, MessageCircle, User, Dumbbell } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { t } from '@/lib/i18n';

const navItems = [
  { href: '/calories', icon: Apple, labelKey: 'nav.home' },
  { href: '/dashboard', icon: TrendingUp, labelKey: 'nav.progress' },
  { href: '/food', icon: BarChart2, labelKey: 'nav.food' },
  { href: '/exercise', icon: Dumbbell, labelKey: 'nav.exercise' },
  { href: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
  { href: '/profile', icon: User, labelKey: 'nav.profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 md:hidden flex justify-center px-3">
      <div className="flex items-center gap-0.5 rounded-[2rem] border border-slate-200/80 bg-white/92 px-1 py-1 shadow-[0_8px_32px_rgba(15,23,42,0.18),0_2px_8px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92 w-full max-w-sm">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.4rem] py-2.5 transition-all duration-200 min-h-[52px] ${
                isActive
                  ? 'bg-[#1A6BFF] text-white shadow-[0_4px_16px_rgba(26,107,255,0.45)]'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                size={21}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-[9px] font-semibold leading-none transition-colors ${isActive ? 'text-white' : ''}`}>
                {t(language, labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
