'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Apple, BarChart2, TrendingUp, MessageCircle, User, Dumbbell, LogOut, Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/components/providers/theme-provider';
import { createClient } from '@/lib/supabase/client';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const navItems = [
  { href: '/calories', icon: Apple, labelKey: 'nav.home' },
  { href: '/dashboard', icon: TrendingUp, labelKey: 'nav.progress' },
  { href: '/food', icon: BarChart2, labelKey: 'nav.food' },
  { href: '/exercise', icon: Dumbbell, labelKey: 'nav.exercise' },
  { href: '/chat', icon: MessageCircle, labelKey: 'nav.chat' },
  { href: '/profile', icon: User, labelKey: 'nav.profile' },
];

const sidebarCopy: Record<Language, {
  tagline: string;
  quickSettings: string;
  light: string;
  dark: string;
  logout: string;
  logoutConfirmTitle: string;
  logoutConfirmDesc: string;
  logoutConfirm: string;
  logoutCancel: string;
}> = {
  en: {
    tagline: 'AI Fitness Coach',
    quickSettings: 'Quick settings',
    light: 'Light',
    dark: 'Dark',
    logout: 'Log out',
    logoutConfirmTitle: 'Log out?',
    logoutConfirmDesc: 'Are you sure you want to log out?',
    logoutConfirm: 'Log out',
    logoutCancel: 'Cancel',
  },
  fr: {
    tagline: 'Coach fitness IA',
    quickSettings: 'Réglages rapides',
    light: 'Clair',
    dark: 'Sombre',
    logout: 'Se déconnecter',
    logoutConfirmTitle: 'Se déconnecter ?',
    logoutConfirmDesc: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    logoutConfirm: 'Se déconnecter',
    logoutCancel: 'Annuler',
  },
  ar: {
    tagline: 'مدرب لياقة ذكي',
    quickSettings: 'إعدادات سريعة',
    light: 'فاتح',
    dark: 'داكن',
    logout: 'تسجيل الخروج',
    logoutConfirmTitle: 'تسجيل الخروج؟',
    logoutConfirmDesc: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    logoutConfirm: 'تسجيل الخروج',
    logoutCancel: 'إلغاء',
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const copy = sidebarCopy[language];
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? null);
        const email = data.user.email ?? '';
        setUserInitials(email.slice(0, 2).toUpperCase());
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 min-h-screen sticky top-0 border-r border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#07101e]">
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#1A6BFF]/[0.04] to-transparent dark:from-[#1A6BFF]/[0.08]" />

      {/* Logo */}
      <div className="relative px-5 py-6 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A6BFF] shadow-[0_4px_16px_rgba(26,107,255,0.45)]">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M12 3C8 3 5 6.5 5 10.5C5 14.5 7.5 17.5 12 21C16.5 17.5 19 14.5 19 10.5C19 6.5 16 3 12 3Z" fill="white" opacity="0.9" />
              <path d="M12 8L13.5 11H16L14 13L14.5 16L12 14.5L9.5 16L10 13L8 11H10.5L12 8Z" fill="white" />
            </svg>
            <div className="absolute inset-0 rounded-xl ring-2 ring-[#1A6BFF]/30" />
          </div>
          <div>
            <span className="text-[1.15rem] font-extrabold tracking-tight text-slate-900 dark:text-white">Progressi</span>
            <p className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">{copy.tagline}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="relative flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-[0.9rem] font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#1A6BFF]/10 text-[#1A6BFF] dark:bg-[#1A6BFF]/12 dark:text-[#4D8FFF]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 hover:text-slate-800 dark:hover:bg-white/[0.05] dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1A6BFF]" />
              )}
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} className="shrink-0" />
              <span className="font-semibold">{t(language, labelKey)}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1A6BFF]" />}
            </Link>
          );
        })}
      </nav>

      {/* Shortcuts divider */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-white/[0.05]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 dark:text-slate-600 mb-2.5">{copy.quickSettings}</p>

        {/* Theme + Language row */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={toggleTheme}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-[#1A6BFF]/40 hover:text-[#1A6BFF] dark:border-white/8 dark:bg-white/4 dark:text-slate-400 dark:hover:text-[#4D8FFF]"
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {theme === 'dark' ? copy.light : copy.dark}
          </button>
          <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/8 dark:bg-white/4">
            {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  language === lang
                    ? 'bg-[#1A6BFF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* User info + logout */}
        {userEmail && (
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/8 dark:bg-white/4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1A6BFF]/12 text-xs font-extrabold text-[#1A6BFF]">
              {userInitials}
            </div>
            <p className="flex-1 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{userEmail}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  title={copy.logout}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <LogOut size={14} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{copy.logoutConfirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{copy.logoutConfirmDesc}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{copy.logoutCancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {copy.logoutConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <p className="mt-3 text-[10px] text-slate-300 dark:text-slate-600">© {new Date().getFullYear()} Progressi</p>
      </div>
    </aside>
  );
}
