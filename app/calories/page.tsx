'use client';

export const dynamic = 'force-dynamic';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Flame, Footprints, GlassWater, Target, TrendingUp, X } from 'lucide-react';
import { WatermelonChart } from '@/components/charts/watermelon-chart';
import { MascotEnergy } from '@/components/mascots/mascot';
import { useLanguage } from '@/hooks/use-language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { localeForLanguage, t, type Language } from '@/lib/i18n';
import { computeBodyMetrics } from '@/lib/health-metrics';
import { localDateString } from '@/lib/utils';

interface Profile {
  current_weight: number | null;
  goal_weight: number | null;
  activity_level: string | null;
  calorie_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight_loss_rate: number | null;
}

interface DailyWellness {
  water_ml: number | null;
  step_count: number | null;
}

function MacroBar({ label, eaten, target, color }: { label: string; eaten: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((eaten / target) * 100, 100) : 0;
  const over = eaten > target;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          <span className="font-bold" style={{ color: over ? '#EF4444' : color }}>{Math.round(eaten)}g</span>
          {' / '}{target}g
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: over ? '#EF4444' : color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label, value, unit, accent, helper, icon,
}: {
  label: string; value: string; unit: string; accent: string; helper: string; icon: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur transition-all dark:bg-white/4"
      style={{ boxShadow: `0 0 0 1px ${accent}18, 0 24px 60px rgba(15,23,42,0.12)` }}
    >
      {/* Glow corner */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-xl transition-opacity group-hover:opacity-35"
        style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <div className="rounded-xl p-2.5" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      </div>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</span>
        <span className="pb-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>
      </div>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </motion.div>
  );
}

const caloriesCopy: Record<Language, Record<string, string>> = {
  en: { showLess: '↑ Show less', showAll: '↓ Show all concepts', snapshot: "Today's energy snapshot", dailyGuidance: 'Daily guidance', hydration: 'Hydration', steps: 'Steps', completeProfile: 'Complete your profile to unlock personalised calorie, macro, and hydration targets based on your body metrics.' },
  fr: { showLess: '↑ Voir moins', showAll: '↓ Voir tous les concepts', snapshot: "Aperçu énergétique du jour", dailyGuidance: 'Guidance du jour', hydration: 'Hydratation', steps: 'Pas', completeProfile: 'Complétez votre profil pour débloquer des objectifs personnalisés en calories, macros et hydratation.' },
  ar: { showLess: '↑ عرض أقل', showAll: '↓ اعرض كل المفاهيم', snapshot: 'ملخص طاقة اليوم', dailyGuidance: 'إرشادات اليوم', hydration: 'الترطيب', steps: 'الخطوات', completeProfile: 'أكمل ملفك لفتح أهداف مخصصة للسعرات والمغذيات والترطيب حسب بيانات جسمك.' },
};

export default function CaloriesPage() {
  const { language } = useLanguage();
  const copy = caloriesCopy[language];
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wellness, setWellness] = useState<DailyWellness | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);

  // Show guide for users who haven't dismissed it
  useEffect(() => {
    const dismissed = localStorage.getItem('calorie_guide_dismissed');
    if (!dismissed) setShowGuide(true);
  }, []);

  const dismissGuide = () => {
    localStorage.setItem('calorie_guide_dismissed', '1');
    setShowGuide(false);
  };

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const today = localDateString();
        const [profileRes, logsRes, wellnessRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('food_logs').select('*').eq('user_id', user.id)
            .gte('logged_at', `${today}T00:00:00`).lte('logged_at', `${today}T23:59:59`),
          supabase.from('daily_wellness').select('*').eq('user_id', user.id).eq('tracking_date', today).maybeSingle(),
        ]);
        if (profileRes.data) setProfile(profileRes.data);
        if (wellnessRes.data) setWellness(wellnessRes.data);
        type LogRow = { calories: number | null; protein: number | null; carbs: number | null; fat: number | null };
        const logs = (logsRes.data || []) as LogRow[];
        setTotalCalories(logs.reduce((s, l) => s + (l.calories || 0), 0));
        setTotalProtein(logs.reduce((s, l) => s + (l.protein || 0), 0));
        setTotalCarbs(logs.reduce((s, l) => s + (l.carbs || 0), 0));
        setTotalFat(logs.reduce((s, l) => s + (l.fat || 0), 0));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, [supabase, user]);

  const metrics = useMemo(() => computeBodyMetrics({
    age: profile?.age, gender: profile?.gender, height: profile?.height,
    currentWeight: profile?.current_weight, goalWeight: profile?.goal_weight,
    activityLevel: profile?.activity_level, weightLossRate: profile?.weight_loss_rate,
  }), [profile]);

  const calorieGoal = profile?.calorie_target ?? metrics?.targetCalories ?? 2000;
  const proteinGoal = profile?.protein_target ?? metrics?.protein ?? 140;
  const carbsGoal = profile?.carbs_target ?? metrics?.carbs ?? 220;
  const fatGoal = profile?.fat_target ?? metrics?.fat ?? 70;
  const remaining = Math.max(0, calorieGoal - totalCalories);
  const completion = calorieGoal > 0 ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0;
  const waterTargetMl = metrics?.hydrationTargetMl ?? 2500;
  const waterMl = wellness?.water_ml ?? 0;
  const stepTarget = metrics?.steps.recommended ?? 8000;
  const stepCount = wellness?.step_count ?? 0;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#1A6BFF] border-t-transparent" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.07),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(26,107,255,0.07),transparent_50%),linear-gradient(180deg,#f9fafb_0%,#f1f5f9_100%)] px-4 py-6 pb-28 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(26,107,255,0.10),transparent_45%),linear-gradient(180deg,#060b14_0%,#080f1c_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ── CALORIE GUIDE (beginner) ──────────────────────────── */}
        <AnimatePresence>
          {showGuide && (
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden rounded-[2rem] border border-blue-200/60 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 shadow-[0_20px_60px_rgba(26,107,255,0.10)] backdrop-blur dark:border-blue-500/20 dark:from-[#0a1628]/80 dark:to-[#0d1f3c]/70"
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-6 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A6BFF]/15">
                    <BookOpen size={16} className="text-[#1A6BFF]" />
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-[#1A6BFF]/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A6BFF]">
                      {t(language, 'calorieGuide.badgeNew')}
                    </span>
                    <h2 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {t(language, 'calorieGuide.headline')}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuideExpanded((v) => !v)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-500 transition hover:bg-white dark:bg-white/8 dark:hover:bg-white/14"
                    aria-label="Toggle guide"
                  >
                    {guideExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button
                    onClick={dismissGuide}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-500 transition hover:bg-white dark:bg-white/8 dark:hover:bg-white/14"
                    aria-label="Dismiss guide"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <p className="px-6 pt-2 text-sm text-slate-500 dark:text-slate-400">
                {t(language, 'calorieGuide.intro')}
              </p>

              {/* Expandable detail */}
              <AnimatePresence initial={false}>
                {guideExpanded && (
                  <motion.div
                    key="guide-body"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 px-6 pb-2 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                      {([
                        { key: 'what',    accent: '#1A6BFF', bg: 'rgba(26,107,255,0.08)'  },
                        { key: 'budget',  accent: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
                        { key: 'deficit', accent: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
                        { key: 'surplus', accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
                        { key: 'macros',  accent: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
                      ] as const).map(({ key, accent, bg }) => (
                        <div
                          key={key}
                          className="rounded-[1.3rem] border border-white/60 bg-white/70 p-4 dark:border-white/8 dark:bg-white/5"
                          style={{ boxShadow: `inset 0 0 0 1px ${accent}18` }}
                        >
                          <p className="text-xs font-bold" style={{ color: accent }}>
                            {t(language, `calorieGuide.${key}_title`)}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {t(language, `calorieGuide.${key}_body`)}
                          </p>
                        </div>
                      ))}
                      {/* Tip card */}
                      <div className="rounded-[1.3rem] border border-[#1A6BFF]/20 bg-[#1A6BFF]/6 p-4 sm:col-span-2 lg:col-span-3">
                        <p className="text-sm font-semibold text-[#1A6BFF]">💡 {t(language, 'calorieGuide.tip')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => setGuideExpanded((v) => !v)}
                  className="text-xs font-semibold text-[#1A6BFF] hover:underline"
                >
                  {guideExpanded ? copy.showLess : copy.showAll}
                </button>
                <button
                  onClick={dismissGuide}
                  className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-slate-300"
                >
                  {t(language, 'calorieGuide.dismiss')}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/70 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/6 dark:bg-slate-900/60">
          {/* Background gradient blobs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/15" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-600/12" />

          <div className="relative grid gap-8 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center sm:p-8">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/50 bg-orange-50/80 px-3 py-1 dark:border-orange-500/20 dark:bg-orange-500/10">
                <Flame size={13} className="text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Calories & Recovery</span>
              </div>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Daily progress that feels like a{' '}
                <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">live coaching</span>{' '}
                screen.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                Calories, macros, water, and steps — all in one place so you always know what&apos;s on track.
              </p>

              {/* Stat cards */}
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {/* Goal */}
                <div className="relative overflow-hidden rounded-2xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-amber-50/60 p-4 dark:border-orange-500/20 dark:bg-gradient-to-br dark:from-orange-500/12 dark:to-amber-600/6">
                  <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-orange-400/20 blur-xl" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Goal</p>
                  <p className="mt-2.5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{calorieGoal.toLocaleString()}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">kcal planned</p>
                </div>
                {/* Consumed */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 dark:border-blue-500/20 dark:bg-gradient-to-br dark:from-blue-500/12 dark:to-indigo-600/6">
                  <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-blue-400/20 blur-xl" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">Consumed</p>
                  <p className="mt-2.5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{Math.round(totalCalories).toLocaleString()}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">{completion.toFixed(0)}% of target</p>
                </div>
                {/* Remaining */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-4 dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-500/12 dark:to-teal-600/6">
                  <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-emerald-400/20 blur-xl" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Remaining</p>
                  <p className="mt-2.5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{remaining.toLocaleString()}</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-400">kcal left today</p>
                </div>
              </div>
            </div>

            {/* Right – mascot */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[280px] overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-b from-slate-800 to-slate-950 p-6 dark:border-white/8">
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.28)_0%,transparent_65%)]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />
                <div className="relative flex flex-col items-center">
                  <MascotEnergy size={160} />
                  <p className="mt-2 text-sm font-semibold text-white/90">{copy.snapshot}</p>
                  <p className="text-xs text-white/45">
                    {new Date().toLocaleDateString(localeForLanguage(language), {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STAT TILES ───────────────────────────────────────── */}
        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Calories" value={Math.round(totalCalories).toString()} unit="kcal" accent="#F97316"
            helper={remaining > 0 ? `${remaining} kcal still available` : "Target reached today"}
            icon={<Flame size={18} />}
          />
          <StatCard label="Hydration" value={(waterMl / 1000).toFixed(1)} unit="L" accent="#06B6D4"
            helper={`${(waterTargetMl / 1000).toFixed(1)} L recommended today`}
            icon={<GlassWater size={18} />}
          />
          <StatCard label="Steps" value={stepCount.toLocaleString()} unit="steps" accent="#10B981"
            helper={`${Math.max(stepTarget - stepCount, 0).toLocaleString()} steps to target`}
            icon={<Footprints size={18} />}
          />
          <StatCard label="Metabolic" value={(metrics?.tdee ?? calorieGoal).toString()} unit="kcal" accent="#8B5CF6"
            helper={metrics ? 'Maintenance estimate from profile' : 'Complete profile to personalise'}
            icon={<TrendingUp size={18} />}
          />
        </section>

        {/* ── CHARTS + MACROS ──────────────────────────────────── */}
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">

          {/* Ring chart card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/6 dark:bg-slate-900/50">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-500">Energy balance</p>
                <h2 className="mt-1.5 text-2xl font-bold text-slate-950 dark:text-white">Calorie progress</h2>
              </div>
              <span className="rounded-full border border-slate-200/80 bg-white/90 px-4 py-1.5 text-sm font-bold text-slate-600 shadow-sm dark:border-white/8 dark:bg-white/5 dark:text-slate-300">
                {completion.toFixed(0)}% done
              </span>
            </div>

            <div className="mt-8 flex justify-center">
              <WatermelonChart consumed={totalCalories} goal={calorieGoal} />
            </div>

            {/* Progress bar below ring */}
            <div className="mt-8 rounded-[1.4rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/6 dark:bg-white/3">
              <div className="mb-2.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">Calorie pacing</span>
                <span className="text-slate-400">{Math.round(totalCalories).toLocaleString()} / {calorieGoal.toLocaleString()} kcal</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Macro distribution */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/6 dark:bg-slate-900/50">
              <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1A6BFF]">{t(language, 'calories.macros')}</p>
                  <h2 className="mt-1.5 text-2xl font-bold text-slate-950 dark:text-white">Macro distribution</h2>
                </div>
                <div className="rounded-xl bg-[#1A6BFF]/10 p-2.5 text-[#1A6BFF]">
                  <Target size={18} />
                </div>
              </div>
              <div className="mt-6 space-y-5">
                <MacroBar label="Protein" eaten={totalProtein} target={proteinGoal} color="#3B82F6" />
                <MacroBar label="Carbs" eaten={totalCarbs} target={carbsGoal} color="#10B981" />
                <MacroBar label="Fat" eaten={totalFat} target={fatGoal} color="#F59E0B" />
              </div>
            </div>

            {/* Macro mini-cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: t(language, 'food.protein'), value: totalProtein, target: proteinGoal, color: '#3B82F6', bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-200/50 dark:border-blue-500/15' },
                { label: t(language, 'food.carbs'), value: totalCarbs, target: carbsGoal, color: '#10B981', bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-200/50 dark:border-emerald-500/15' },
                { label: t(language, 'food.fat'), value: totalFat, target: fatGoal, color: '#F59E0B', bg: 'from-amber-500/10 to-amber-600/5', border: 'border-amber-200/50 dark:border-amber-500/15' },
              ].map((m) => (
                <div key={m.label}
                  className={`relative overflow-hidden rounded-[1.6rem] border ${m.border} bg-gradient-to-br ${m.bg} p-4 backdrop-blur`}
                >
                  <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full blur-xl opacity-40"
                    style={{ background: m.color }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{m.label}</p>
                  <p className="mt-2.5 text-2xl font-black text-slate-950 dark:text-white">{Math.round(m.value)}g</p>
                  <p className="mt-0.5 text-xs text-slate-400">Target {m.target}g</p>
                  <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-white/40 dark:bg-white/8">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Daily guidance */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-sky-50/80 to-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/6 dark:from-sky-900/20 dark:to-slate-900/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-500">{copy.dailyGuidance}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-sky-200/60 bg-white/70 p-4 dark:border-sky-500/15 dark:bg-white/4">
                  <div className="flex items-center gap-2">
                    <GlassWater size={14} className="text-sky-500" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{copy.hydration}</p>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{(waterTargetMl / 1000).toFixed(1)} L</p>
                  <p className="text-xs text-slate-400">{(waterMl / 1000).toFixed(1)} L logged so far</p>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-200/60 bg-white/70 p-4 dark:border-emerald-500/15 dark:bg-white/4">
                  <div className="flex items-center gap-2">
                    <Footprints size={14} className="text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{copy.steps}</p>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{stepTarget.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{stepCount.toLocaleString()} tracked so far</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {!profile?.calorie_target && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-700 backdrop-blur dark:border-amber-500/20 dark:bg-amber-500/8 dark:text-amber-300"
          >
            <TrendingUp size={16} className="mt-0.5 shrink-0" />
            <span>{copy.completeProfile}</span>
          </motion.div>
        )}
      </div>
    </main>
  );
}
