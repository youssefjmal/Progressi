'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Activity, Droplets, Flame, Footprints, Gauge, TrendingUp, Dumbbell, Plus, Minus, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { computeBodyMetrics, getExerciseIntensity } from '@/lib/health-metrics';
import { localDateString } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MascotRunner } from '@/components/mascots/mascot';

interface AiFeedback {
  score: number;
  scoreLabel: string;
  scoreColor: string;
  headline: string;
  insights: { type: string; status: string; text: string }[];
  tip: string;
  encouragement: string;
}

interface Profile {
  first_name: string | null;
  age: number | null;
  gender: string | null;
  current_weight: number | null;
  goal_weight: number | null;
  height: number | null;
  activity_level: string | null;
  calorie_target: number | null;
  weight_loss_rate: number | null;
}

interface WeightEntry {
  id: string;
  weight_kg: number;
  recorded_at: string;
}

interface FoodLog {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

interface ExerciseLog {
  id: string;
  calories_burned: number;
  duration: number | null;
  category: string;
  total_volume?: number | null;
  logged_at: string;
}

interface DailyWellness {
  water_ml: number;
  step_count: number;
  tracking_date: string;
}

function ProgressBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <Icon size={14} style={{ color }} />
          {label}
        </span>
        <span className="font-semibold text-slate-900 dark:text-white">{Math.max(0, Math.min(value, 100))}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} transition={{ duration: 0.7 }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [wellness, setWellness] = useState<DailyWellness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const today = localDateString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [profileRes, weightRes, foodRes, exerciseRes, wellnessRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('weight_history').select('*').eq('user_id', user.id).order('recorded_at', { ascending: true }).limit(30),
          supabase.from('food_logs').select('calories,protein,carbs,fat,logged_at').eq('user_id', user.id).gte('logged_at', weekAgo),
          supabase.from('exercise_logs').select('id,calories_burned,duration,category,total_volume,logged_at').eq('user_id', user.id).gte('logged_at', weekAgo),
          supabase.from('daily_wellness').select('*').eq('user_id', user.id).eq('tracking_date', today).maybeSingle(),
        ]);
        setProfile(profileRes.data);
        setWeightHistory(weightRes.data || []);
        setFoodLogs(foodRes.data || []);
        setExerciseLogs(exerciseRes.data || []);
        setWellness(wellnessRes.data || null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, supabase]);

  const computed = useMemo(
    () =>
      computeBodyMetrics({
        age: profile?.age,
        gender: profile?.gender,
        height: profile?.height,
        currentWeight: profile?.current_weight,
        goalWeight: profile?.goal_weight,
        activityLevel: profile?.activity_level,
        weightLossRate: profile?.weight_loss_rate,
      }),
    [profile],
  );

  const today = localDateString();
  const todayFood = foodLogs.filter((log) => log.logged_at.startsWith(today));
  const todayExercise = exerciseLogs.filter((log) => log.logged_at.startsWith(today));
  const caloriesConsumed = todayFood.reduce((sum, log) => sum + log.calories, 0);
  const caloriesBurned = todayExercise.reduce((sum, log) => sum + log.calories_burned, 0);
  const strengthVolume = todayExercise.reduce((sum, log) => sum + Number(log.total_volume || 0), 0);
  const protein = todayFood.reduce((sum, log) => sum + (log.protein || 0), 0);
  const carbs = todayFood.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const fat = todayFood.reduce((sum, log) => sum + (log.fat || 0), 0);
  const stepCount = wellness?.step_count ?? 0;
  const waterMl = wellness?.water_ml ?? 0;
  const stepGoal = computed?.steps.recommended ?? 8000;
  const waterGoal = computed?.hydrationTargetMl ?? 2500;
  const calorieGoal = computed?.targetCalories ?? profile?.calorie_target ?? 2000;
  const netCalories = Math.round(caloriesConsumed - caloriesBurned);

  const averageIntensity =
    todayExercise.filter((log) => log.duration).length > 0
      ? getExerciseIntensity(
          Math.round(todayExercise.reduce((sum, log) => sum + (log.duration || 0), 0) / todayExercise.filter((log) => log.duration).length),
          Math.round(todayExercise.reduce((sum, log) => sum + log.calories_burned, 0) / todayExercise.filter((log) => log.duration).length),
        )
      : null;

  const calorieBarData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().split('T')[0];
    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      consumed: Math.round(foodLogs.filter((log) => log.logged_at.startsWith(key)).reduce((sum, log) => sum + log.calories, 0)),
      burned: Math.round(exerciseLogs.filter((log) => log.logged_at.startsWith(key)).reduce((sum, log) => sum + log.calories_burned, 0)),
    };
  });

  const macroData = [
    { name: 'Protein', value: Math.round(protein), color: '#3B82F6' },
    { name: 'Carbs', value: Math.round(carbs), color: '#10B981' },
    { name: 'Fat', value: Math.round(fat), color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  const upsertWellness = async (patch: Partial<DailyWellness>) => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const trackingDate = localDateString();
      const base = { water_ml: wellness?.water_ml ?? 0, step_count: wellness?.step_count ?? 0 };
      const next = { ...base, ...patch };
      if (wellness) {
        const { data } = await supabase.from('daily_wellness').update(next).eq('user_id', user.id).eq('tracking_date', trackingDate).select().single();
        if (data) setWellness(data);
      } else {
        const { data } = await supabase.from('daily_wellness').insert({ user_id: user.id, tracking_date: trackingDate, ...next }).select().single();
        if (data) setWellness(data);
      }
    } catch (error) {
      console.error('Wellness save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addWater = (amount: number) => upsertWellness({ water_ml: Math.max(0, waterMl + amount) });
  const addSteps = () => {
    const amount = parseInt(stepInput, 10);
    if (!Number.isFinite(amount)) return;
    upsertWellness({ step_count: Math.max(0, stepCount + amount) });
    setStepInput('');
  };

  const loadAiFeedback = async () => {
    setIsFeedbackLoading(true);
    setFeedbackError(false);
    try {
      const res = await fetch(`/api/ai-feedback?date=${localDateString()}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiFeedback(data);
    } catch {
      setFeedbackError(true);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-[#1A6BFF] border-t-transparent animate-spin" /></div>;
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-24 dark:bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1A6BFF]">Progress</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {profile?.first_name ? `${profile.first_name}'s` : 'Your'} daily overview
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Calories, movement, training, and body trends combined in a single view updated in real time.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-blue-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">Consumed</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(caloriesConsumed)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kcal today</p>
                </div>
                <div className="rounded-[1.4rem] border border-violet-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Burned</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(caloriesBurned)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kcal exercised</p>
                </div>
                <div className={`rounded-[1.4rem] border bg-white/88 p-4 dark:border-white/10 dark:bg-white/5 ${netCalories > calorieGoal ? 'border-red-200/70' : 'border-emerald-200/70'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${netCalories > calorieGoal ? 'text-red-500' : 'text-emerald-600'}`}>Net</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{netCalories}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kcal net</p>
                </div>
              </div>
            </div>

            {/* Right mascot panel */}
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(219,234,254,0.74))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.74))]">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),rgba(255,255,255,0)_72%)] p-3">
                  <MascotRunner size={170} />
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.3rem] border border-white/75 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">Calorie target</p>
                    <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{calorieGoal} <span className="text-sm font-semibold text-slate-400">kcal</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-cyan-500">{(waterMl / 1000).toFixed(1)}L</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Water</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-emerald-500">{stepCount.toLocaleString()}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Steps</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-violet-500">{Math.round(strengthVolume)}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Vol. kg</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-orange-500">{computed?.bmi ?? '—'}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">BMI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────────────────── */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

          {/* Sticky sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">

            {/* Goal completion */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Today's completion</p>
              <div className="mt-5 space-y-4">
                <ProgressBar label="Hydration" value={Math.round((waterMl / waterGoal) * 100)} color="#06B6D4" icon={Droplets} />
                <ProgressBar label="Steps" value={Math.round((stepCount / stepGoal) * 100)} color="#10B981" icon={Footprints} />
                <ProgressBar label="Calorie target" value={Math.round((caloriesConsumed / calorieGoal) * 100)} color="#F59E0B" icon={Gauge} />
              </div>
            </div>

            {/* Water tracker */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets size={15} className="text-cyan-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Hydration</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{(waterMl / 1000).toFixed(2)} / {(waterGoal / 1000).toFixed(1)} L</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[250, 500].map((ml) => (
                  <Button key={ml} onClick={() => addWater(ml)} disabled={isSaving} variant="outline" className="flex-1 h-10 rounded-[0.9rem] border-cyan-200/80 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-semibold">
                    <Plus size={12} className="mr-1" />{ml} ml
                  </Button>
                ))}
                <Button onClick={() => addWater(-waterMl)} disabled={isSaving || waterMl === 0} variant="ghost" className="h-10 w-10 rounded-[0.9rem] text-slate-400 hover:text-rose-500 shrink-0">
                  <Minus size={14} />
                </Button>
              </div>
            </div>

            {/* Step tracker */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Footprints size={15} className="text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Steps</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stepCount.toLocaleString()} / {stepGoal.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  type="number"
                  placeholder="Add steps"
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSteps()}
                  className="h-10 flex-1 rounded-[0.9rem] input-glow text-sm"
                />
                <Button onClick={addSteps} disabled={isSaving || !stepInput} className="h-10 rounded-[0.9rem] bg-emerald-600 hover:bg-emerald-700 text-white px-4">
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            {/* Macro split */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Macro split</p>
              {macroData.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No food logged yet today.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={64} paddingAngle={4}>
                          {macroData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {macroData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between rounded-[1rem] border border-white/60 bg-white/76 px-3 py-2 text-sm dark:border-white/8 dark:bg-white/4">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{entry.value} g</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main charts */}
          <div className="space-y-5">

            {/* Calorie bar chart */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Last 7 days</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Calories in vs calories burned</h2>
              <div className="mt-2 flex items-center gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1A6BFF]" />Consumed</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" />Burned</span>
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={calorieBarData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="consumed" radius={[6, 6, 0, 0]}>
                      {calorieBarData.map((_, index) => <Cell key={`c-${index}`} fill="#1A6BFF" />)}
                    </Bar>
                    <Bar dataKey="burned" radius={[6, 6, 0, 0]}>
                      {calorieBarData.map((_, index) => <Cell key={`b-${index}`} fill="#8B5CF6" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Weight trend */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Weight trend</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Bodyweight history</h2>
              <div className="mt-4">
                {weightHistory.length < 2 ? (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5">
                    <p className="text-base font-semibold text-slate-900 dark:text-white">No weight history yet</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add a few entries from the Profile page to unlock the trend line.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={weightHistory.map((entry) => ({ date: new Date(entry.recorded_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }), weight: entry.weight_kg }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Today's body status */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Body status</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Today at a glance</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'BMI', value: computed?.bmi ?? '—', sub: computed?.bmiCategory.label ?? 'fill profile', color: computed?.bmiCategory.color ?? '#94A3B8' },
                  { label: 'Workout intensity', value: averageIntensity?.label ?? 'None', sub: `${todayExercise.length} entries`, color: '#8B5CF6' },
                  { label: 'Net calories', value: netCalories.toString(), sub: `vs ${calorieGoal} kcal goal`, color: netCalories > calorieGoal ? '#EF4444' : '#10B981' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.84))] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.74),rgba(15,23,42,0.86))]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Daily Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#1A6BFF,#8B5CF6)] text-white shadow-[0_4px_14px_rgba(26,107,255,0.35)]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">AI Coach</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily feedback</h2>
                  </div>
                </div>
                <button
                  onClick={loadAiFeedback}
                  disabled={isFeedbackLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#1A6BFF]/40 hover:text-[#1A6BFF] dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-[#4D8FFF]"
                >
                  <RefreshCw size={15} className={isFeedbackLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {!aiFeedback && !isFeedbackLoading && !feedbackError && (
                <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center dark:border-white/10 dark:bg-white/5">
                  <Sparkles size={24} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Get your AI coaching report</p>
                  <p className="mt-1 text-xs text-slate-400">Analyzes your food, exercise, and wellness data to give you personalized insights.</p>
                  <button
                    onClick={loadAiFeedback}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#1A6BFF,#8B5CF6)] px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(26,107,255,0.35)] transition hover:opacity-90"
                  >
                    <Sparkles size={14} />
                    Generate feedback
                  </button>
                </div>
              )}

              {isFeedbackLoading && (
                <div className="mt-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-[1.2rem] bg-slate-100 dark:bg-white/8" />
                  ))}
                </div>
              )}

              {feedbackError && !isFeedbackLoading && (
                <div className="mt-5 flex items-center gap-3 rounded-[1.2rem] border border-rose-200/60 bg-rose-50/60 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/8">
                  <AlertCircle size={16} className="shrink-0 text-rose-500" />
                  <p className="text-sm text-rose-600 dark:text-rose-300">Couldn't load feedback. Check your connection and try again.</p>
                </div>
              )}

              {aiFeedback && !isFeedbackLoading && (
                <div className="mt-5 space-y-4">
                  {/* Score row */}
                  <div className="flex items-center gap-4 rounded-[1.4rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(239,246,255,0.8))] p-4 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(30,41,59,0.7),rgba(15,23,42,0.8))]">
                    <div
                      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${aiFeedback.scoreColor}, ${aiFeedback.scoreColor}99)` }}
                    >
                      <span className="text-2xl font-black leading-none">{aiFeedback.score}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">score</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: aiFeedback.scoreColor }}>{aiFeedback.scoreLabel}</p>
                      <p className="mt-0.5 text-base font-semibold text-slate-900 dark:text-white">{aiFeedback.headline}</p>
                    </div>
                  </div>

                  {/* Insights grid */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {aiFeedback.insights.map((insight) => {
                      const isGood = ['on_track', 'done'].includes(insight.status);
                      const isWarn = ['low', 'under', 'light'].includes(insight.status);
                      return (
                        <div
                          key={insight.type}
                          className={`flex items-start gap-3 rounded-[1.2rem] border p-3 ${
                            isGood
                              ? 'border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/8'
                              : isWarn
                              ? 'border-amber-200/60 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/8'
                              : 'border-slate-200/60 bg-slate-50/60 dark:border-white/10 dark:bg-white/5'
                          }`}
                        >
                          <CheckCircle2
                            size={15}
                            className={`mt-0.5 shrink-0 ${isGood ? 'text-emerald-500' : isWarn ? 'text-amber-500' : 'text-slate-400'}`}
                          />
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{insight.text}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tip */}
                  <div className="flex items-start gap-3 rounded-[1.2rem] border border-[#1A6BFF]/15 bg-[#1A6BFF]/5 p-4">
                    <Zap size={15} className="mt-0.5 shrink-0 text-[#1A6BFF]" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1A6BFF]">Today's tip</p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{aiFeedback.tip}</p>
                    </div>
                  </div>

                  {/* Encouragement */}
                  <div className="rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(26,107,255,0.08),rgba(139,92,246,0.08))] px-4 py-3 text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 italic">"{aiFeedback.encouragement}"</p>
                  </div>
                </div>
              )}
            </motion.div>

          </div>
        </section>
      </div>
    </main>
  );
}
