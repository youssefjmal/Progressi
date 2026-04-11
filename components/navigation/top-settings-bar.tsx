'use client';

import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/components/providers/theme-provider';
import type { Language } from '@/lib/i18n';

const HIDDEN_PATHS = ['/', '/auth/login', '/auth/sign-up', '/auth/signup'];

export function TopSettingsBar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith('/auth'))) return null;

  return (
    <div className="fixed top-0 right-0 z-50 flex items-center gap-2 px-4 py-2.5 md:px-6">
      {/* Language toggle */}
      <div className="flex items-center gap-0.5 bg-background/80 backdrop-blur-md border border-border rounded-lg p-0.5 shadow-sm">
        {(['en', 'fr', 'ar'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              language === lang
                ? 'bg-[#1A6BFF] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-background/80 backdrop-blur-md border border-border shadow-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
}
