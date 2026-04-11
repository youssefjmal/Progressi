'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Apple, ChevronRight, Droplets, Footprints, Mail, MessageCircle, Moon, Phone, Sparkles, Sun, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/components/providers/theme-provider';
import { TopNav } from '@/components/navigation/top-nav';
import { t } from '@/lib/i18n';
import { MascotRobot } from '@/components/mascots/mascot';

const features = [
  { icon: Apple, title: 'Food logging that understands real meals', desc: 'Log meals from your food database or by describing what you ate in chat.' },
  { icon: Footprints, title: 'Steps and movement targets', desc: 'Track walking goals, adherence, and daily movement without switching tools.' },
  { icon: Droplets, title: 'Hydration tracking', desc: 'Keep daily water targets visible so the dashboard reflects what actually happened.' },
  { icon: MessageCircle, title: 'Focused health coach', desc: 'The assistant stays inside food, training, recovery, and health topics to protect token usage.' },
];

const dailyTips = [
  { title: 'Breakfast idea', body: 'Pair protein with fruit and slower carbs so the morning meal keeps energy stable longer.' },
  { title: 'Hydration rule', body: 'Spread water intake through the day instead of trying to catch up late at night.' },
  { title: 'Training nutrition', body: 'After training, combine protein with a moderate carb source to support recovery.' },
];

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push('/dashboard');
      else setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6BFF] border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(26,107,255,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,#f4f9ff_0%,#edf5ff_42%,#f7fbff_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(26,107,255,0.20),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1830_42%,#0b1020_100%)]">
      <TopNav />

      <section className="overflow-hidden px-6 pb-20 pt-24">
        <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-white/65 bg-white/72 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8 dark:border-white/8 dark:bg-white/5">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <div>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="inline-flex items-center gap-2 rounded-full bg-[#1A6BFF]/10 px-4 py-1.5 text-sm font-medium text-[#1A6BFF]">
                <Sparkles size={14} />
                Built for food, training, water, and recovery tracking
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.02] text-slate-900 dark:text-white md:text-6xl">
                Track what your body needs, not just what you type into an app.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Coachini combines calorie intake, hydration, steps, workouts, health-focused chat, and daily recommendations into one responsive web app for phone and desktop.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/auth/sign-up" className="gradient-btn inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base">
                  {t(language, 'landing.ctaStart')}
                  <ChevronRight size={18} />
                </Link>
                <Link href="/auth/login" className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted">
                  {t(language, 'landing.ctaSignin')}
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-10 grid gap-3 sm:grid-cols-3">
                {[{ label: 'Daily calories', value: 'Smart target', icon: FlameSafe }, { label: 'Hydration', value: 'Water goal', icon: Droplets }, { label: 'Movement', value: 'Step guidance', icon: Footprints }].map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(239,246,255,0.80))] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/8 dark:bg-white/5">
                    <item.icon size={18} className="text-[#1A6BFF]" />
                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="relative">
              <div className="absolute left-8 top-8 h-52 w-52 rounded-full bg-[#1A6BFF]/20 blur-3xl" />
              <div className="absolute bottom-6 right-6 h-44 w-44 rounded-full bg-sky-400/18 blur-3xl" />
              <div className="relative rounded-[2.4rem] border border-white/65 bg-white/78 p-5 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
                <div className="grid gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
                  <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#1A6BFF]/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.26),rgba(255,255,255,0)_66%),linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.74))] p-4 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.28),rgba(15,23,42,0)_62%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(30,41,59,0.74))]">
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF] dark:border-white/10 dark:bg-white/10">Coach mode</div>
                    <div className="absolute h-36 w-36 rounded-full border border-[#1A6BFF]/15" />
                    <div className="absolute h-52 w-52 rounded-full border border-sky-300/40 dark:border-sky-400/15" />
                    <div className="absolute h-20 w-20 rounded-full bg-white/65 blur-2xl dark:bg-[#1A6BFF]/20" />
                    <MascotRobot size={190} />
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.4rem] border border-white/60 bg-white/76 p-4 dark:border-white/8 dark:bg-white/4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">Today</p>
                          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">1,840 kcal</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">consumed from meals and snacks</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#1A6BFF] text-sm font-bold text-[#1A6BFF]">78%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ label: 'Protein', value: '142g', color: '#3B82F6' }, { label: 'Water', value: '2.4L', color: '#06B6D4' }, { label: 'Steps', value: '8.2k', color: '#10B981' }].map((item) => (
                        <div key={item.label} className="rounded-[1.1rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(239,246,255,0.74))] p-3 text-center dark:border-white/8 dark:bg-white/4">
                          <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[1.4rem] border border-[#1A6BFF]/15 bg-[linear-gradient(135deg,rgba(26,107,255,0.08),rgba(14,165,233,0.05))] p-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Diet recommendation</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Balance today&apos;s intake with lean protein, fruit, and more water before dinner to keep energy stable and macros on target.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-white/65 bg-white/72 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8 dark:border-white/8 dark:bg-white/5">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">What You Track</p>
            <h2 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">A single health system, not disconnected pages</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[1.8rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,255,0.82))] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/8 dark:bg-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A6BFF]/10 text-[#1A6BFF]"><feature.icon size={20} /></div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Home Recommendations</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Tips and food guidance you can actually use</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {dailyTips.map((tip) => (
                <div key={tip.title} className="rounded-[1.4rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,255,0.76))] p-4 dark:border-white/8 dark:bg-white/4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{tip.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Responsive By Design</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">Made for phone and desktop</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <p>Use it like a mobile health tracker during the day, then open the same account on desktop to review deeper trends and body metrics.</p>
              <p>The same daily system tracks meals, water, steps, workouts, and dashboard summaries.</p>
            </div>
            <div className="mt-6 rounded-[1.4rem] border border-[#1A6BFF]/15 bg-[linear-gradient(135deg,rgba(26,107,255,0.10),rgba(14,165,233,0.06))] p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Daily snapshot</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[{ label: 'Meals', value: '4' }, { label: 'Water', value: '2.4L' }, { label: 'Steps', value: '8.2k' }, { label: 'Burn', value: '420' }].map((item) => (
                  <div key={item.label} className="rounded-[1rem] bg-white/70 px-3 py-3 text-center dark:bg-white/6">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white/50 px-6 py-12 backdrop-blur dark:bg-[#0A0A0F]/50">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Top row */}
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <span className="text-2xl font-extrabold text-[#1A6BFF]">Coachini</span>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/sign-up" className="transition-colors hover:text-foreground">{t(language, 'landing.ctaStart')}</Link>
              <Link href="/auth/login" className="transition-colors hover:text-foreground">{t(language, 'landing.ctaSignin')}</Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button onClick={() => setLanguage('en')} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>EN</button>
                <button onClick={() => setLanguage('fr')} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${language === 'fr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>FR</button>
              </div>
              <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle dark mode">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* Contact row */}
          <div className="rounded-[1.6rem] border border-white/65 bg-[linear-gradient(135deg,rgba(26,107,255,0.06),rgba(14,165,233,0.04))] px-6 py-5 dark:border-white/8 dark:bg-white/4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{t(language, 'landing.contactTitle')}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
              <a href="tel:+21625460" className="flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-[#1A6BFF] dark:text-slate-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A6BFF]/10">
                  <Phone size={14} className="text-[#1A6BFF]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">{t(language, 'landing.contactPhone')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">+216 25 460</p>
                </div>
              </a>
              <a href="mailto:youssefjmel42@gmail.com" className="flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-[#1A6BFF] dark:text-slate-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A6BFF]/10">
                  <Mail size={14} className="text-[#1A6BFF]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">{t(language, 'landing.contactEmail')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">youssefjmel42@gmail.com</p>
                </div>
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} Coachini. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FlameSafe(props: { size?: number; className?: string }) {
  return <Target {...props} />;
}
