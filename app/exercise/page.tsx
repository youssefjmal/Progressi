'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MascotLifter } from '@/components/mascots/mascot';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { computeBodyMetrics, getExerciseIntensity } from '@/lib/health-metrics';
import { localDateString } from '@/lib/utils';
import { Apple, ArrowUpRight, Dumbbell, Flame, Footprints, Plus, Scale, Timer, Trash2, Trophy } from 'lucide-react';

const EXERCISES = [
  { name: 'Running (8 km/h)', category: 'Cardio', met: 8.3 },
  { name: 'Running (12 km/h)', category: 'Cardio', met: 11.5 },
  { name: 'Running (intervals)', category: 'Cardio', met: 10.5 },
  { name: 'Sprinting', category: 'Cardio', met: 15.0 },
  { name: 'Cycling (moderate)', category: 'Cardio', met: 6.8 },
  { name: 'Cycling (vigorous)', category: 'Cardio', met: 10.0 },
  { name: 'Elliptical Trainer', category: 'Cardio', met: 5.0 },
  { name: 'Rowing Machine', category: 'Cardio', met: 7.0 },
  { name: 'Jump Rope', category: 'Cardio', met: 11.8 },
  { name: 'Swimming', category: 'Cardio', met: 8.0 },
  { name: 'Walking (5 km/h)', category: 'Cardio', met: 3.5 },
  { name: 'Walking (brisk)', category: 'Cardio', met: 4.8 },
  { name: 'Stair Climber', category: 'Cardio', met: 8.8 },
  { name: 'Dance Cardio', category: 'Cardio', met: 6.5 },
  { name: 'HIIT', category: 'Cardio', met: 10.0 },
  { name: 'Boxing', category: 'Cardio', met: 7.8 },
  { name: 'Bench Press', category: 'Strength', met: 5.0 },
  { name: 'Close-Grip Bench Press', category: 'Strength', met: 5.0 },
  { name: 'Paused Bench Press', category: 'Strength', met: 5.0 },
  { name: 'Dumbbell Shoulder Press', category: 'Strength', met: 5.0 },
  { name: 'Seated Dumbbell Shoulder Press', category: 'Strength', met: 5.0 },
  { name: 'Arnold Press', category: 'Strength', met: 5.0 },
  { name: 'Incline Dumbbell Press', category: 'Strength', met: 5.0 },
  { name: 'Incline Smith Machine Press', category: 'Strength', met: 5.0 },
  { name: 'Incline Barbell Press', category: 'Strength', met: 5.0 },
  { name: 'Flat Dumbbell Press', category: 'Strength', met: 5.0 },
  { name: 'Machine Chest Press', category: 'Strength', met: 4.5 },
  { name: 'Cable Fly', category: 'Strength', met: 3.8 },
  { name: 'Pec Deck', category: 'Strength', met: 3.8 },
  { name: 'Squat', category: 'Strength', met: 5.5 },
  { name: 'Front Squat', category: 'Strength', met: 5.5 },
  { name: 'Hack Squat', category: 'Strength', met: 5.0 },
  { name: 'Bulgarian Split Squat', category: 'Strength', met: 5.0 },
  { name: 'Leg Press', category: 'Strength', met: 5.0 },
  { name: 'Leg Extension', category: 'Strength', met: 3.8 },
  { name: 'Leg Curl', category: 'Strength', met: 3.8 },
  { name: 'Calf Raise', category: 'Strength', met: 3.5 },
  { name: 'Deadlift', category: 'Strength', met: 6.0 },
  { name: 'Romanian Deadlift', category: 'Strength', met: 5.5 },
  { name: 'Stiff-Leg Deadlift', category: 'Strength', met: 5.5 },
  { name: 'Smith Machine Romanian Deadlift', category: 'Strength', met: 5.0 },
  { name: 'Pull-ups', category: 'Strength', met: 5.5 },
  { name: 'Chin-ups', category: 'Strength', met: 5.5 },
  { name: 'Lat Pulldown', category: 'Strength', met: 4.5 },
  { name: 'Machine Row', category: 'Strength', met: 4.5 },
  { name: 'Chest-Supported Row', category: 'Strength', met: 4.5 },
  { name: 'Single-Arm Dumbbell Row', category: 'Strength', met: 4.5 },
  { name: 'Seated Cable Row', category: 'Strength', met: 4.5 },
  { name: 'Barbell Row', category: 'Strength', met: 5.0 },
  { name: 'Barbell Bent-Over Row', category: 'Strength', met: 5.0 },
  { name: 'Shoulder Press', category: 'Strength', met: 5.0 },
  { name: 'Lateral Raise', category: 'Strength', met: 3.5 },
  { name: 'Rear Delt Fly', category: 'Strength', met: 3.5 },
  { name: 'Face Pull', category: 'Strength', met: 3.5 },
  { name: 'JM Press', category: 'Strength', met: 4.5 },
  { name: 'Biceps Curl', category: 'Strength', met: 3.5 },
  { name: 'Hammer Curl', category: 'Strength', met: 3.5 },
  { name: 'Preacher Curl', category: 'Strength', met: 3.5 },
  { name: 'Triceps Pushdown', category: 'Strength', met: 3.5 },
  { name: 'Skull Crusher', category: 'Strength', met: 4.0 },
  { name: 'Overhead Triceps Extension', category: 'Strength', met: 3.8 },
  { name: 'Lunges', category: 'Strength', met: 4.5 },
  { name: 'Hip Thrust', category: 'Strength', met: 5.0 },
  { name: 'Glute Bridge', category: 'Strength', met: 4.0 },
  { name: 'Plank', category: 'Strength', met: 3.3 },
  { name: 'Cable Crunch', category: 'Strength', met: 3.8 },
  { name: 'Hanging Leg Raise', category: 'Strength', met: 4.0 },
  { name: 'Cable Machine Workout', category: 'Strength', met: 4.5 },
  { name: 'Weight Training (general)', category: 'Strength', met: 4.0 },
  { name: 'Yoga', category: 'Recovery', met: 3.0 },
  { name: 'Pilates', category: 'Recovery', met: 3.0 },
  { name: 'Stretching', category: 'Recovery', met: 2.3 },
  { name: 'Mobility Session', category: 'Recovery', met: 2.8 },
  { name: 'Foam Rolling', category: 'Recovery', met: 2.0 },
  { name: 'Breathwork', category: 'Recovery', met: 1.5 },
  { name: 'Football', category: 'Sports', met: 8.0 },
  { name: 'Basketball', category: 'Sports', met: 6.5 },
  { name: 'Tennis', category: 'Sports', met: 7.3 },
  { name: 'Padel', category: 'Sports', met: 6.0 },
  { name: 'Volleyball', category: 'Sports', met: 4.0 },
  { name: 'Martial Arts', category: 'Sports', met: 10.3 },
  { name: 'Handball', category: 'Sports', met: 8.0 },
];

function calcBurn(met: number, weight: number, durationMin: number) {
  return Math.round(met * weight * (durationMin / 60));
}
function calcVolume(sets: number, reps: number, weight: number) {
  return Math.round(sets * reps * weight * 10) / 10;
}
function calcEstimatedOneRm(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

interface ExerciseLog {
  id: string;
  name: string;
  category: string;
  duration: number | null;
  calories_burned: number;
  sets?: number | null;
  reps?: number | null;
  weight_used?: number | null;
  total_volume?: number | null;
  estimated_1rm?: number | null;
  logged_at: string;
}
interface ExerciseOption { id?: string; name: string; category: string; met: number; }
interface Profile { age: number | null; gender: string | null; height: number | null; current_weight: number | null; goal_weight: number | null; activity_level: string | null; weight_loss_rate: number | null; }
interface DailyWellness { id: string; step_count: number; water_ml: number; tracking_date: string; }
interface FoodItem { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; serving_size: number; serving_unit: string; }

const categories = ['All', 'Cardio', 'Strength', 'Recovery', 'Sports'];

export default function ExercisePage() {
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [dailyWellness, setDailyWellness] = useState<DailyWellness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>(EXERCISES);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption>(EXERCISES[0]);
  const [duration, setDuration] = useState('30');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8');
  const [weightUsed, setWeightUsed] = useState('20');
  const [searchEx, setSearchEx] = useState('');
  const [stepInput, setStepInput] = useState('');
  const [isSavingWellness, setIsSavingWellness] = useState(false);
  // Quick food log
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [quickFoodSearch, setQuickFoodSearch] = useState('');
  const [quickFoodSelected, setQuickFoodSelected] = useState<FoodItem | null>(null);
  const [quickFoodQty, setQuickFoodQty] = useState('100');
  const [quickFoodMeal, setQuickFoodMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('snacks');
  const [isQuickLogging, setIsQuickLogging] = useState(false);
  const [quickFoodLogged, setQuickFoodLogged] = useState(false);

  const isStrengthExercise = selectedExercise.category === 'Strength';

  const loadData = async () => {
    if (!user) return;
    const today = localDateString();
    const [profileRes, logsRes, wellnessRes, exercisesRes, foodsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('exercise_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`).order('logged_at', { ascending: false }),
      supabase.from('daily_wellness').select('*').eq('user_id', user.id).eq('tracking_date', today).maybeSingle(),
      supabase.from('exercises').select('id,name,category,met').order('category').order('name'),
      supabase.from('foods').select('id,name,calories,protein,carbs,fat,serving_size,serving_unit').order('name'),
    ]);
    setProfile(profileRes.data);
    setLogs(logsRes.data || []);
    setDailyWellness(wellnessRes.data || null);
    setFoods(foodsRes.data || []);
    if (!exercisesRes.error && exercisesRes.data?.length > 0) {
      setExerciseOptions(exercisesRes.data);
      setSelectedExercise((prev) => exercisesRes.data.find((i: ExerciseOption) => i.name === prev.name) ?? exercisesRes.data[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const computed = useMemo(() => computeBodyMetrics({
    age: profile?.age, gender: profile?.gender, height: profile?.height,
    currentWeight: profile?.current_weight, goalWeight: profile?.goal_weight,
    activityLevel: profile?.activity_level, weightLossRate: profile?.weight_loss_rate,
  }), [profile]);

  const weight = profile?.current_weight ?? 75;
  const parsedDuration = parseInt(duration, 10) || 0;
  const parsedSets = parseInt(sets, 10) || 0;
  const parsedReps = parseInt(reps, 10) || 0;
  const parsedWeightUsed = parseFloat(weightUsed) || 0;
  const previewCalories = isStrengthExercise ? 0 : calcBurn(selectedExercise.met, weight, parsedDuration || 30);
  const previewVolume = isStrengthExercise ? calcVolume(parsedSets, parsedReps, parsedWeightUsed) : 0;
  const previewOneRm = isStrengthExercise && parsedWeightUsed > 0 && parsedReps > 0 ? calcEstimatedOneRm(parsedWeightUsed, parsedReps) : 0;
  const totalBurned = logs.reduce((s, l) => s + l.calories_burned, 0);
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const totalStrengthVolume = logs.filter((l) => l.category === 'Strength').reduce((s, l) => s + Number(l.total_volume || 0), 0);
  const stepGoal = computed?.steps.recommended ?? 8000;
  const currentSteps = dailyWellness?.step_count ?? 0;
  const strengthLogs = logs.filter((l) => l.category === 'Strength');
  const selectedExStrengthLogs = strengthLogs.filter((l) => l.name === selectedExercise.name);
  const bestWeight = selectedExStrengthLogs.reduce((m, l) => Math.max(m, Number(l.weight_used || 0)), 0);
  const bestVolume = selectedExStrengthLogs.reduce((m, l) => Math.max(m, Number(l.total_volume || 0)), 0);
  const bestOneRm = selectedExStrengthLogs.reduce((m, l) => Math.max(m, Number(l.estimated_1rm || 0)), 0);
  const filteredExercises = exerciseOptions.filter((e) => (categoryFilter === 'All' || e.category === categoryFilter) && e.name.toLowerCase().includes(searchEx.toLowerCase()));

  const upsertWellness = async (patch: { step_count?: number; water_ml?: number }) => {
    if (!user) return;
    const today = localDateString();
    setIsSavingWellness(true);
    try {
      if (dailyWellness?.id) {
        const { data } = await supabase.from('daily_wellness').update(patch).eq('id', dailyWellness.id).select().single();
        if (data) setDailyWellness(data);
      } else {
        const { data } = await supabase.from('daily_wellness').insert({ user_id: user.id, tracking_date: today, step_count: 0, water_ml: 0, ...patch }).select().single();
        if (data) setDailyWellness(data);
      }
    } finally { setIsSavingWellness(false); }
  };

  const handleAdd = async () => {
    if (!user) return;
    setIsAdding(true);
    try {
      const isStrength = selectedExercise.category === 'Strength';
      const s = parseInt(sets, 10) || 0;
      const r = parseInt(reps, 10) || 0;
      const w = parseFloat(weightUsed) || 0;
      const d = parseInt(duration, 10) || 0;
      if (isStrength && (!s || !r || !w)) { setIsAdding(false); return; }
      if (!isStrength && !d) { setIsAdding(false); return; }
      const { data, error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        name: selectedExercise.name,
        category: selectedExercise.category,
        duration: isStrength ? null : d,
        calories_burned: isStrength ? 0 : calcBurn(selectedExercise.met, weight, d),
        sets: isStrength ? s : null,
        reps: isStrength ? r : null,
        weight_used: isStrength ? w : null,
        total_volume: isStrength ? calcVolume(s, r, w) : null,
        estimated_1rm: isStrength ? calcEstimatedOneRm(w, r) : null,
      }).select().single();
      if (error) throw error;
      setLogs((prev) => [data, ...prev]);
      setShowForm(false);
      setDuration('30'); setSets('3'); setReps('8'); setWeightUsed('20'); setSearchEx('');
    } catch (e) { console.error(e); }
    finally { setIsAdding(false); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('exercise_logs').delete().eq('id', id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleQuickFoodLog = async () => {
    if (!quickFoodSelected || !user) return;
    setIsQuickLogging(true);
    try {
      const qty = parseFloat(quickFoodQty) || 100;
      const multiplier = qty / (quickFoodSelected.serving_size || 100);
      await supabase.from('food_logs').insert({
        user_id: user.id,
        food_id: quickFoodSelected.id,
        meal_type: quickFoodMeal,
        quantity: qty,
        unit: quickFoodSelected.serving_unit,
        calories: Math.round(quickFoodSelected.calories * multiplier * 10) / 10,
        protein: Math.round(quickFoodSelected.protein * multiplier * 10) / 10,
        carbs: Math.round(quickFoodSelected.carbs * multiplier * 10) / 10,
        fat: Math.round(quickFoodSelected.fat * multiplier * 10) / 10,
      });
      setQuickFoodSelected(null);
      setQuickFoodSearch('');
      setQuickFoodQty('100');
      setQuickFoodLogged(true);
      setTimeout(() => setQuickFoodLogged(false), 2000);
    } catch (e) { console.error(e); }
    finally { setIsQuickLogging(false); }
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" /></div>;
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ede9fe_0%,#f5f3ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-24 dark:bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Training</p>
              <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                A workout logger that tracks strength and cardio in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Log every lift with sets, reps, and weight, or track cardio by duration and calories burned.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-[1.4rem] border border-violet-200/70 bg-white/88 p-4 dark:border-violet-500/20 dark:bg-violet-500/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Volume</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(totalStrengthVolume)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kg lifted</p>
                </div>
                <div className="rounded-[1.4rem] border border-red-200/70 bg-white/88 p-4 dark:border-red-500/20 dark:bg-red-500/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-500">Burned</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{totalBurned}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kcal</p>
                </div>
                <div className="rounded-[1.4rem] border border-sky-200/70 bg-white/88 p-4 dark:border-sky-500/20 dark:bg-sky-500/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Cardio</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{totalMinutes}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">min</p>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-200/70 bg-white/88 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/8">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Steps</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{currentSteps.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">today</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(237,233,254,0.74))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,27,75,0.88),rgba(15,23,42,0.74))]">
              <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),rgba(255,255,255,0)_72%)] p-3">
                  <MascotLifter size={160} />
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.3rem] border border-white/75 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600">Today&apos;s best lift</p>
                    <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{bestWeight > 0 ? `${bestWeight} kg` : '—'}</p>
                    <p className="text-xs text-slate-400">{selectedExercise.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-violet-600">{bestOneRm > 0 ? `${bestOneRm}` : '—'}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Est. 1RM</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-sky-600">{strengthLogs.length}</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Strength sets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTENT ──────────────────────────────────────────── */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

          {/* Left sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">

            {/* Log workout */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Quick log</p>
              <Button
                onClick={() => setShowForm((p) => !p)}
                className="mt-3 h-12 w-full justify-between rounded-[1rem] bg-violet-600 text-white hover:bg-violet-700"
              >
                {showForm ? 'Close form' : 'Log a workout'}
                <Plus size={16} />
              </Button>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-4 border-t border-border pt-4">
                      {/* Category filter */}
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => (
                          <button key={cat} type="button" onClick={() => setCategoryFilter(cat)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${categoryFilter === cat ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                      <Input placeholder="Search exercise..." value={searchEx} onChange={(e) => setSearchEx(e.target.value)} className="input-glow rounded-xl" />
                      <div className="max-h-44 space-y-1 overflow-y-auto">
                        {filteredExercises.map((ex) => (
                          <button key={ex.name} type="button" onClick={() => setSelectedExercise(ex)}
                            className={`w-full rounded-[0.9rem] border px-3 py-2 text-left text-sm transition ${selectedExercise.name === ex.name ? 'border-violet-500 bg-violet-500/10 text-violet-600' : 'border-border hover:bg-muted'}`}>
                            <span className="font-medium">{ex.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{ex.category}</span>
                          </button>
                        ))}
                      </div>

                      {isStrengthExercise ? (
                        <>
                          <div className="grid gap-3 grid-cols-3">
                            <div className="space-y-1"><Label className="text-xs">Sets</Label><Input type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} className="input-glow rounded-xl h-10" /></div>
                            <div className="space-y-1"><Label className="text-xs">Reps</Label><Input type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} className="input-glow rounded-xl h-10" /></div>
                            <div className="space-y-1"><Label className="text-xs">kg</Label><Input type="number" min="0" step="0.5" value={weightUsed} onChange={(e) => setWeightUsed(e.target.value)} className="input-glow rounded-xl h-10" /></div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-[1rem] border border-border bg-muted/40 p-2.5 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Volume</p>
                              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{Math.round(previewVolume)}</p>
                            </div>
                            <div className="rounded-[1rem] border border-border bg-muted/40 p-2.5 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">1RM est.</p>
                              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{previewOneRm || 0}kg</p>
                            </div>
                            <div className="rounded-[1rem] border border-border bg-muted/40 p-2.5 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Best</p>
                              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{bestWeight || 0}kg</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="grid gap-3 grid-cols-2">
                          <div className="space-y-1"><Label className="text-xs">Duration (min)</Label><Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="input-glow rounded-xl h-10" /></div>
                          <div className="space-y-1"><Label className="text-xs">Est. burn</Label><div className="flex h-10 items-center rounded-xl border border-border bg-muted/40 px-3 text-sm font-bold text-red-500">{previewCalories} kcal</div></div>
                        </div>
                      )}

                      <Button onClick={handleAdd} disabled={isAdding} className="h-11 w-full rounded-2xl bg-violet-600 text-white hover:bg-violet-700">
                        {isAdding ? 'Logging...' : isStrengthExercise ? 'Add lift' : 'Add cardio'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Food Log */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Apple size={15} className="text-emerald-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Log Food</p>
              </div>
              <div className="mt-3 space-y-2.5">
                {/* Food search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search food..."
                    value={quickFoodSearch}
                    onChange={(e) => { setQuickFoodSearch(e.target.value); setQuickFoodSelected(null); }}
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/25"
                  />
                </div>
                {/* Suggestions */}
                {quickFoodSearch.length >= 1 && !quickFoodSelected && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-border bg-background shadow-md">
                    {foods.filter((f) => f.name.toLowerCase().includes(quickFoodSearch.toLowerCase())).slice(0, 8).map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => { setQuickFoodSelected(food); setQuickFoodSearch(food.name); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60"
                      >
                        <p className="font-medium text-foreground">{food.name}</p>
                        <p className="text-xs text-muted-foreground">{food.calories} kcal / {food.serving_size}{food.serving_unit}</p>
                      </button>
                    ))}
                    {foods.filter((f) => f.name.toLowerCase().includes(quickFoodSearch.toLowerCase())).length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No match found</p>
                    )}
                  </div>
                )}
                {/* Quantity + meal */}
                {quickFoodSelected && (
                  <div className="space-y-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{quickFoodSelected.name}</p>
                      <p className="text-[11px] text-slate-400">{Math.round(quickFoodSelected.calories * ((parseFloat(quickFoodQty) || 100) / (quickFoodSelected.serving_size || 100)))} kcal for {quickFoodQty}{quickFoodSelected.serving_unit}</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quickFoodQty}
                        onChange={(e) => setQuickFoodQty(e.target.value)}
                        className="h-9 w-20 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/25"
                      />
                      <select
                        value={quickFoodMeal}
                        onChange={(e) => setQuickFoodMeal(e.target.value as typeof quickFoodMeal)}
                        className="h-9 flex-1 appearance-none rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none"
                      >
                        {['breakfast', 'lunch', 'dinner', 'snacks'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleQuickFoodLog}
                  disabled={!quickFoodSelected || isQuickLogging}
                  className={`h-9 w-full rounded-xl text-sm ${quickFoodLogged ? 'bg-green-600 hover:bg-green-600' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                >
                  {quickFoodLogged ? 'Logged!' : isQuickLogging ? 'Saving…' : 'Log to food diary'}
                </Button>
              </div>
            </div>

            {/* Steps */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Steps</p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-950 dark:text-white">{currentSteps.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">goal: {stepGoal.toLocaleString()}</p>
                </div>
                <Footprints size={20} className="text-emerald-500" />
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min((currentSteps / stepGoal) * 100, 100)}%` }} />
              </div>
              <div className="mt-3 flex gap-2">
                <Input type="number" placeholder="Add steps..." value={stepInput} onChange={(e) => setStepInput(e.target.value)} className="input-glow h-9 flex-1 rounded-xl text-sm" />
                <Button variant="outline" disabled={isSavingWellness} onClick={() => { const v = parseInt(stepInput, 10); if (!Number.isFinite(v)) return; upsertWellness({ step_count: Math.max(0, currentSteps + v) }); setStepInput(''); }}
                  className="h-9 rounded-xl border-slate-200/80 px-3 hover:border-emerald-500 hover:text-emerald-600 dark:border-white/10">
                  Add
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="space-y-5">
            {/* Lift progress for selected exercise */}
            {isStrengthExercise && bestWeight > 0 && (
              <section className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Lift Progress</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{selectedExercise.name}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Trophy, label: 'Best Weight', value: `${bestWeight} kg`, color: 'text-violet-600', bg: 'bg-violet-500/10' },
                    { icon: Scale, label: 'Best Volume', value: `${Math.round(bestVolume)} kg`, color: 'text-sky-600', bg: 'bg-sky-500/10' },
                    { icon: ArrowUpRight, label: 'Best 1RM', value: `${bestOneRm} kg`, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-4 rounded-[1.2rem] border border-white/60 bg-white/72 px-4 py-3 dark:border-white/8 dark:bg-white/4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg} ${s.color}`}><s.icon size={16} /></div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{s.label}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Session log */}
            <section className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Session</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">Today&apos;s workout history</h2>
                </div>
                <span className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {logs.length} entries
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {logs.length === 0 ? (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5">
                    <Dumbbell size={24} className="mx-auto mb-3 text-slate-400" />
                    <p className="text-base font-semibold text-slate-900 dark:text-white">No workouts logged yet</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the quick log panel to add your first entry.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {logs.map((log) => {
                      const intensity = log.duration ? getExerciseIntensity(log.duration, log.calories_burned) : null;
                      return (
                        <motion.div key={log.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,243,255,0.84))] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,27,75,0.6),rgba(15,23,42,0.86))]">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-base font-semibold text-slate-950 dark:text-white">{log.name}</p>
                                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">{log.category}</span>
                                {intensity && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white" style={{ background: intensity.color }}>{intensity.label}</span>}
                              </div>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {log.category === 'Strength'
                                  ? `${log.sets ?? 0} × ${log.reps ?? 0} reps — ${log.weight_used ?? 0} kg — vol ${Math.round(log.total_volume ?? 0)}`
                                  : `${log.duration ?? 0} min`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {log.category === 'Strength'
                                  ? <p className="text-sm font-bold text-violet-600">{log.estimated_1rm ?? 0} kg 1RM</p>
                                  : <p className="text-sm font-bold text-red-500">−{log.calories_burned} kcal</p>}
                              </div>
                              <button type="button" onClick={() => handleDelete(log.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
