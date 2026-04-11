'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Calculator, ChevronDown, ChevronUp, Droplets, Flame, Footprints, LogOut, Save, Scale, Timer, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MascotStar } from '@/components/mascots/mascot';
import { useLanguage } from '@/hooks/use-language';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { computeBodyMetrics } from '@/lib/health-metrics';
import type { Language } from '@/lib/i18n';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  current_weight: number | null;
  goal_weight: number | null;
  activity_level: string | null;
  language: Language;
  calorie_target: number | null;
  weight_loss_rate: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
}

interface WeightEntry {
  id: string;
  weight_kg: number;
  recorded_at: string;
  note: string | null;
}

const activityOptions = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Mostly seated work with little movement.' },
  { value: 'lightlyActive', label: 'Lightly Active', desc: 'Light exercise several days per week.' },
  { value: 'moderatelyActive', label: 'Moderately Active', desc: 'Consistent training and active daily rhythm.' },
  { value: 'veryActive', label: 'Very Active', desc: 'Frequent training or physical lifestyle.' },
];

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{current} / {target} g</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Weight history
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);
  const [weightLogged, setWeightLogged] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const [profileRes, weightRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('weight_history').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(10),
    ]);
    if (profileRes.data) {
      setProfile({ ...profileRes.data, weight_loss_rate: profileRes.data.weight_loss_rate ?? 0.5 });
    }
    setWeightHistory(weightRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

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

  const handleSave = async () => {
    if (!profile || !user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const upsertPayload: Record<string, unknown> = {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        current_weight: profile.current_weight,
        goal_weight: profile.goal_weight,
        activity_level: profile.activity_level,
        language: profile.language,
        weight_loss_rate: profile.weight_loss_rate,
      };
      if (computed) {
        upsertPayload.calorie_target = computed.targetCalories;
        upsertPayload.protein_target = computed.protein;
        upsertPayload.carbs_target = computed.carbs;
        upsertPayload.fat_target = computed.fat;
      }
      const { error } = await supabase.from('profiles').upsert(upsertPayload);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Save failed. Try again.';
      setSaveError(msg);
      console.error('Profile save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogWeight = async () => {
    if (!weightInput || !user) return;
    setIsLoggingWeight(true);
    try {
      const { data, error } = await supabase
        .from('weight_history')
        .insert({ user_id: user.id, weight_kg: parseFloat(weightInput), note: weightNote || null })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setWeightHistory((prev) => [data, ...prev.slice(0, 9)]);
        // Update profile current_weight
        setProfile((prev) => prev ? { ...prev, current_weight: parseFloat(weightInput) } : prev);
        await supabase.from('profiles').update({ current_weight: parseFloat(weightInput) }).eq('id', user.id);
      }
      setWeightInput('');
      setWeightNote('');
      setWeightLogged(true);
      setShowWeightForm(false);
      setTimeout(() => setWeightLogged(false), 2200);
    } catch (error) {
      console.error('Weight log error:', error);
    } finally {
      setIsLoggingWeight(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#1A6BFF] border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user || !profile) return null;

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Your Profile';
  const weightDiff = profile.current_weight && profile.goal_weight
    ? Math.round((profile.current_weight - profile.goal_weight) * 10) / 10
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-24 dark:bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1A6BFF]">Body Profile</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {displayName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Your base data powers the calorie target, macro splits, and step goals shown across every screen.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-blue-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">BMI</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{computed?.bmi ?? '—'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{computed?.bmiCategory.label ?? 'fill profile'}</p>
                </div>
                <div className="rounded-[1.4rem] border border-orange-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Target</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{computed?.targetCalories ?? '—'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">kcal / day</p>
                </div>
                <div className="rounded-[1.4rem] border border-violet-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">To goal</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                    {computed?.weeksToGoal ? `${computed.weeksToGoal}w` : '—'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {weightDiff != null ? `${Math.abs(weightDiff)} kg ${weightDiff > 0 ? 'to lose' : 'to gain'}` : 'at current pace'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right mascot panel */}
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(219,234,254,0.74))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.74))]">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),rgba(255,255,255,0)_72%)] p-3">
                  <MascotStar size={170} />
                </div>
                <div className="space-y-3">
                  <div className="rounded-[1.3rem] border border-white/75 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">Current weight</p>
                    <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                      {profile.current_weight ?? '—'} <span className="text-lg font-semibold text-slate-400">kg</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-[#3B82F6]">{computed?.protein ?? '—'}g</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Protein</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-[#10B981]">{computed?.carbs ?? '—'}g</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Carbs</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-[#F59E0B]">{computed?.fat ?? '—'}g</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Fat</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-cyan-500">{computed ? (computed.hydrationTargetMl / 1000).toFixed(1) : '—'}L</p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Water</p>
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

            {/* Weight log card */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <button
                onClick={() => setShowWeightForm((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-[#1A6BFF]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Log Weight</p>
                </div>
                {showWeightForm ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>

              <AnimatePresence initial={false}>
                {showWeightForm && (
                  <motion.div
                    key="wform"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label className="text-xs text-slate-500">Weight (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={`e.g. ${profile.current_weight ?? 75}`}
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          className="mt-1.5 rounded-xl input-glow"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Note (optional)</Label>
                        <Input
                          placeholder="morning, post-workout…"
                          value={weightNote}
                          onChange={(e) => setWeightNote(e.target.value)}
                          className="mt-1.5 rounded-xl input-glow"
                        />
                      </div>
                      <Button
                        onClick={handleLogWeight}
                        disabled={!weightInput || isLoggingWeight}
                        className={`w-full rounded-xl ${weightLogged ? 'bg-green-600 hover:bg-green-600' : 'bg-[#1A6BFF] hover:bg-[#1456d1]'} text-white`}
                      >
                        <Scale size={14} className="mr-2" />
                        {weightLogged ? 'Logged!' : isLoggingWeight ? 'Saving…' : 'Log Weight'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent weight history */}
              {weightHistory.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Recent</p>
                  {weightHistory.slice(0, 5).map((entry, i) => (
                    <div key={entry.id} className={`flex items-center justify-between rounded-xl px-3 py-2 ${i === 0 ? 'bg-[#1A6BFF]/8 border border-[#1A6BFF]/15' : 'bg-slate-50 dark:bg-white/4'}`}>
                      <div>
                        <p className={`text-sm font-bold ${i === 0 ? 'text-[#1A6BFF]' : 'text-slate-900 dark:text-white'}`}>{entry.weight_kg} kg</p>
                        {entry.note && <p className="text-[11px] text-slate-400">{entry.note}</p>}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(entry.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Body targets summary */}
            {computed && (
              <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Daily Targets</p>
                <div className="mt-5 space-y-4">
                  <MacroBar label="Protein" current={0} target={computed.protein} color="#3B82F6" />
                  <MacroBar label="Carbs" current={0} target={computed.carbs} color="#10B981" />
                  <MacroBar label="Fat" current={0} target={computed.fat} color="#F59E0B" />
                </div>
                <div className="mt-4 rounded-[1.2rem] border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
                      <Droplets size={14} />
                      <span className="text-xs font-semibold">Water</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{(computed.hydrationTargetMl / 1000).toFixed(1)} L</span>
                  </div>
                </div>
                <div className="mt-3 rounded-[1.2rem] border border-violet-500/15 bg-violet-500/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300">
                      <Footprints size={14} />
                      <span className="text-xs font-semibold">Steps</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{computed.steps.recommended.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save + logout */}
            <div className="space-y-3">
              {saveError && (
                <div className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {saveError}
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full rounded-xl ${saved ? 'bg-green-600 hover:bg-green-600' : 'bg-[#1A6BFF] hover:bg-[#1456d1]'} text-white`}
              >
                <Save size={15} className="mr-2" />
                {saved ? 'Saved!' : isSaving ? 'Saving…' : 'Save Profile'}
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="w-full rounded-xl">
                <LogOut size={15} className="mr-2" />
                Log out
              </Button>
            </div>
          </aside>

          {/* Main form area */}
          <div className="space-y-5">

            {/* Personal info */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Personal info</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Name & demographics</h2>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>First name</Label>
                    <Input value={profile.first_name || ''} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="input-glow rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last name</Label>
                    <Input value={profile.last_name || ''} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="input-glow rounded-xl" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Age</Label>
                    <Input type="number" value={profile.age || ''} onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value, 10) : null })} className="input-glow rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 text-sm text-foreground input-glow"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Body measurements */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Body metrics</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Height & weight targets</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={profile.height || ''} onChange={(e) => setProfile({ ...profile, height: e.target.value ? parseFloat(e.target.value) : null })} className="input-glow rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Current weight (kg)</Label>
                  <Input type="number" step="0.1" value={profile.current_weight || ''} onChange={(e) => setProfile({ ...profile, current_weight: e.target.value ? parseFloat(e.target.value) : null })} className="input-glow rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Goal weight (kg)</Label>
                  <Input type="number" step="0.1" value={profile.goal_weight || ''} onChange={(e) => setProfile({ ...profile, goal_weight: e.target.value ? parseFloat(e.target.value) : null })} className="input-glow rounded-xl" />
                </div>
              </div>

              {computed && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-[#1A6BFF]/15 bg-[linear-gradient(135deg,rgba(26,107,255,0.08),rgba(16,185,129,0.04))] p-4">
                    <div className="flex items-center gap-2 text-[#1A6BFF]">
                      <Timer size={14} />
                      <p className="text-xs font-semibold">Goal pacing</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {computed.weeksToGoal
                        ? `~${computed.weeksToGoal} weeks at current pace`
                        : 'Currently on maintenance'}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-orange-500/15 bg-orange-500/5 p-4">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-300">
                      <Flame size={14} />
                      <p className="text-xs font-semibold">TDEE</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Maintenance is <span className="font-bold text-slate-900 dark:text-white">{computed.tdee} kcal</span>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Activity level */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Lifestyle</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Activity level</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {activityOptions.map((option) => {
                  const selected = profile.activity_level === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, activity_level: option.value })}
                      className={`flex items-start justify-between rounded-[1.2rem] border px-4 py-3.5 text-left transition ${
                        selected
                          ? 'border-[#1A6BFF]/45 bg-[#1A6BFF]/8'
                          : 'border-border bg-background hover:border-[#1A6BFF]/30'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${selected ? 'text-[#1A6BFF]' : 'text-foreground'}`}>{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      <Activity size={15} className={`mt-0.5 shrink-0 ${selected ? 'text-[#1A6BFF]' : 'text-muted-foreground'}`} />
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Weight loss rate */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Goal pacing</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Weight loss rate</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A larger deficit means faster results but higher fatigue. Most people do best at 0.5 kg/week.</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { rate: 0.25, label: 'Conservative', desc: '~250 kcal/day deficit' },
                  { rate: 0.5, label: 'Moderate', desc: '~500 kcal/day deficit' },
                  { rate: 1, label: 'Aggressive', desc: '~1 000 kcal/day deficit' },
                ].map(({ rate, label, desc }) => {
                  const selected = (profile.weight_loss_rate ?? 0.5) === rate;
                  return (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setProfile({ ...profile, weight_loss_rate: rate })}
                      className={`rounded-[1.2rem] border px-3 py-4 text-center transition ${
                        selected
                          ? 'border-[#1A6BFF]/45 bg-[#1A6BFF]/8 text-[#1A6BFF]'
                          : 'border-border bg-background text-foreground hover:border-[#1A6BFF]/30'
                      }`}
                    >
                      <p className="text-2xl font-extrabold">{rate}</p>
                      <p className="mt-0.5 text-[11px] font-semibold">{label}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

          </div>
        </section>
      </div>
    </main>
  );
}
