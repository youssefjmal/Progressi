'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, ArrowUp, CheckCircle2, Droplets, Dumbbell, Flame, Footprints, MessageSquareText, Minus, PencilLine, Plus, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MascotRobot } from '@/components/mascots/mascot';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useLanguage } from '@/hooks/use-language';
import { computeBodyMetrics } from '@/lib/health-metrics';
import { localDateString } from '@/lib/utils';
import { t, type Language } from '@/lib/i18n';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  meal_type?: MealType;
}

interface ExerciseItem {
  name: string;
  category: string;
  duration: number;
  calories_burned: number;
  sets?: number | null;
  reps?: number | null;
  weight_used?: number | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  foodDraft?: FoodItem[] | null;
  foodDraftApplied?: boolean;
  foodDraftError?: string | null;
  exerciseDraft?: ExerciseItem[] | null;
  exerciseDraftApplied?: boolean;
}

interface TodayFoodLog {
  id: string;
  food_name: string;
  meal_type: MealType;
  calories: number;
  quantity: number;
  unit: string;
}

interface FoodLogRow {
  id: string;
  food_id: string;
  meal_type: MealType;
  calories: number;
  quantity: number;
  unit: string;
}

interface Profile {
  age: number | null;
  gender: string | null;
  current_weight: number | null;
  goal_weight: number | null;
  height: number | null;
  activity_level: string | null;
  weight_loss_rate: number | null;
}

interface DailyWellness {
  id: string;
  water_ml: number;
  step_count: number;
  tracking_date: string;
}

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

const chatCopy: Record<Language, Record<string, string>> = {
  en: { intro: 'Describe meals, log exercise, or ask about your body. Parsed entries are editable before they save to your log.', loggedToday: 'Logged today', kcalConsumed: 'kcal consumed', quickPrompts: 'Quick prompts', todaysIntake: "Today's intake", noFood: 'No food logged yet today.', addSteps: 'Add steps', conversation: 'Conversation', oneThread: 'Meals, hydration, steps, and training in one thread', coachable: 'Describe the day like a coachable log', receipts: 'Meals become editable receipts. Water and steps stay visible in the sidebar.', mealReceipt: 'Meal Receipt', saved: 'Saved', saving: 'Saving...', saveToday: 'Save To Today', exerciseDraft: 'Exercise Draft', healthChat: 'Health Chat', water: 'Water', steps: 'Steps', hydration: 'Hydration', ofGoal: 'of goal' },
  fr: { intro: 'Décrivez vos repas, enregistrez vos exercices ou posez une question sur votre corps. Les éléments détectés restent modifiables avant enregistrement.', loggedToday: "Enregistré aujourd'hui", kcalConsumed: 'kcal consommées', quickPrompts: 'Prompts rapides', todaysIntake: "Apport d'aujourd'hui", noFood: "Aucun aliment enregistré aujourd'hui.", addSteps: 'Ajouter des pas', conversation: 'Conversation', oneThread: 'Repas, hydratation, pas et entraînement dans un seul fil', coachable: 'Décrivez la journée comme un journal coachable', receipts: "Les repas deviennent des fiches modifiables. L'eau et les pas restent visibles sur le côté.", mealReceipt: 'Fiche repas', saved: 'Enregistré', saving: 'Enregistrement...', saveToday: "Enregistrer aujourd'hui", exerciseDraft: "Brouillon d'exercice", healthChat: 'Santé & Chat', water: 'Eau', steps: 'Pas', hydration: 'Hydratation', ofGoal: "de l'objectif" },
  ar: { intro: 'صف وجباتك أو سجل تمرينك أو اسأل عن جسمك. العناصر المستخرجة تبقى قابلة للتعديل قبل حفظها.', loggedToday: 'المسجل اليوم', kcalConsumed: 'سعرة مستهلكة', quickPrompts: 'اقتراحات سريعة', todaysIntake: 'استهلاك اليوم', noFood: 'لا يوجد طعام مسجل اليوم.', addSteps: 'أضف خطوات', conversation: 'المحادثة', oneThread: 'الوجبات والترطيب والخطوات والتمرين في محادثة واحدة', coachable: 'صف يومك كأنه سجل قابل للتوجيه', receipts: 'تتحول الوجبات إلى بطاقات قابلة للتعديل، مع بقاء الماء والخطوات ظاهرة في الجانب.', mealReceipt: 'بطاقة الوجبة', saved: 'تم الحفظ', saving: 'جارٍ الحفظ...', saveToday: 'احفظ لليوم', exerciseDraft: 'مسودة تمرين', healthChat: 'دردشة الصحة', water: 'الماء', steps: 'الخطوات', hydration: 'الترطيب', ofGoal: 'من الهدف' },
};

function parseBlock<T>(content: string, tag: string): T[] | null {
  const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

function parseDrafts(content: string) {
  return {
    cleanContent: content
      .replace(/<food_log>[\s\S]*?<\/food_log>/, '')
      .replace(/<exercise_log>[\s\S]*?<\/exercise_log>/, '')
      .trim(),
    foodDraft: parseBlock<FoodItem>(content, 'food_log'),
    exerciseDraft: parseBlock<ExerciseItem>(content, 'exercise_log'),
  };
}

function stripPartialTags(text: string) {
  return text
    .replace(/<food_log>[\s\S]*?<\/food_log>/, '')
    .replace(/<food_log>[\s\S]*$/, '')
    .replace(/<exercise_log>[\s\S]*?<\/exercise_log>/, '')
    .replace(/<exercise_log>[\s\S]*$/, '')
    .trim();
}

function normalizeFoodDraft(items: FoodItem[] | null) {
  if (!items) return null;
  return items.map((item) => ({
    name: item.name || 'Food',
    calories: Number(item.calories) || 0,
    protein: Number(item.protein) || 0,
    carbs: Number(item.carbs) || 0,
    fat: Number(item.fat) || 0,
    quantity: Number(item.quantity) || 100,
    unit: item.unit || 'g',
    meal_type: mealTypes.includes(item.meal_type as MealType) ? (item.meal_type as MealType) : 'snacks',
  }));
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[1.6rem] rounded-tl-md border border-white/70 bg-white/84 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.span
              key={i}
              className="inline-block h-2 w-2 rounded-full bg-[#1A6BFF]/70"
              animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ repeat: Infinity, duration: 0.9, delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const { language } = useLanguage();
  const copy = chatCopy[language];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [todayLogs, setTodayLogs] = useState<TodayFoodLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wellness, setWellness] = useState<DailyWellness | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [applyingFood, setApplyingFood] = useState<string | null>(null);
  const [stepInput, setStepInput] = useState('');

  const loadToday = async () => {
    if (!user) return;
    const today = localDateString();
    const [profileRes, foodsRes, logsRes, wellnessRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('foods').select('id,name'),
      supabase.from('food_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`).lte('logged_at', `${today}T23:59:59`).order('logged_at', { ascending: false }),
      supabase.from('daily_wellness').select('*').eq('user_id', user.id).eq('tracking_date', today).maybeSingle(),
    ]);
    const foodsById = new Map(
      (foodsRes.data || []).map((food) => [(food as { id: string; name: string }).id, (food as { id: string; name: string }).name]),
    );
    setProfile(profileRes.data);
    const mappedLogs = ((logsRes.data || []) as FoodLogRow[]).map((log) => ({
      id: log.id,
      food_name: foodsById.get(log.food_id) || 'Food',
      meal_type: log.meal_type,
      calories: log.calories,
      quantity: log.quantity,
      unit: log.unit,
    }));
    setTodayLogs(mappedLogs);
    setWellness(wellnessRes.data || null);
    setIsPageLoading(false);
  };

  useEffect(() => {
    if (user) loadToday();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const computed = useMemo(
    () =>
      computeBodyMetrics({
        age: profile?.age,
        gender: profile?.gender,
        currentWeight: profile?.current_weight,
        goalWeight: profile?.goal_weight,
        height: profile?.height,
        activityLevel: profile?.activity_level,
        weightLossRate: profile?.weight_loss_rate,
      }),
    [profile],
  );

  const stepGoal = computed?.steps.recommended ?? 8000;
  const waterGoal = computed?.hydrationTargetMl ?? 2500;
  const waterMl = wellness?.water_ml ?? 0;
  const stepCount = wellness?.step_count ?? 0;
  const caloriesToday = todayLogs.reduce((sum, log) => sum + log.calories, 0);

  const upsertWellness = async (next: { water_ml?: number; step_count?: number }) => {
    if (!user) return;
    const today = localDateString();
    const payload = {
      user_id: user.id,
      tracking_date: today,
      water_ml: next.water_ml ?? waterMl,
      step_count: next.step_count ?? stepCount,
    };
    if (wellness?.id) {
      const { data } = await supabase.from('daily_wellness').update(payload).eq('id', wellness.id).select().single();
      if (data) setWellness(data);
    } else {
      const { data } = await supabase.from('daily_wellness').insert(payload).select().single();
      if (data) setWellness(data);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    const assistantId = `${Date.now() + 1}`;
    let fullContent = '';

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })) }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const chunk = JSON.parse(data);
            if (chunk.type === 'text-start' && !started) {
              started = true;
              setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);
            } else if (chunk.type === 'text-delta') {
              fullContent += chunk.delta;
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: stripPartialTags(fullContent) } : m)));
            }
          } catch {}
        }
      }

      const { cleanContent, foodDraft, exerciseDraft } = parseDrafts(fullContent);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: cleanContent, foodDraft: normalizeFoodDraft(foodDraft), exerciseDraft } : m,
        ),
      );
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: 'I could not process that message.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraftItem = (messageId: string, index: number, field: keyof FoodItem, value: string | number) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || !message.foodDraft) return message;
        const nextDraft = message.foodDraft.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]:
                  field === 'name' || field === 'unit' || field === 'meal_type' ? value : Number(value) || 0,
              }
            : item,
        );
        return { ...message, foodDraft: nextDraft, foodDraftError: null };
      }),
    );
  };

  const applyFoodDraft = async (messageId: string, items: FoodItem[]) => {
    setApplyingFood(messageId);
    try {
      const res = await fetch('/api/log-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, foodDraftApplied: true, foodDraftError: null } : m)));
      await loadToday();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to save meal';
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, foodDraftError: msg } : m)),
      );
    } finally {
      setApplyingFood(null);
    }
  };

  if (authLoading || isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#1A6BFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const quickQuestions = [
    'I ate 2 eggs, oatmeal, and a banana for breakfast',
    'For lunch I had chicken breast, rice, and salad',
    'I drank a latte and ate 3 dates as a snack',
    'How much water should I drink today?',
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-28 dark:bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── Mobile compact header ───────────────────────────── */}
        <div className="sm:hidden mb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{t(language, 'chat.title')}</h1>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-blue-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-lg font-black text-slate-950 dark:text-white">{Math.round(caloriesToday)}</p>
              <p className="text-[10px] font-semibold text-[#1A6BFF] uppercase tracking-wide">kcal</p>
            </div>
            <div className="rounded-2xl border border-cyan-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-lg font-black text-slate-950 dark:text-white">{(waterMl / 1000).toFixed(1)}L</p>
              <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wide">{copy.water}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-lg font-black text-slate-950 dark:text-white">{stepCount.toLocaleString()}</p>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{copy.steps}</p>
            </div>
          </div>
        </div>

        {/* ── Hero (desktop only) ──────────────────────────────── */}
        <section className="hidden sm:block rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1A6BFF]">{copy.healthChat}</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {t(language, 'chat.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {copy.intro}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-blue-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">{copy.loggedToday}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(caloriesToday)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.kcalConsumed}</p>
                </div>
                <div className="rounded-[1.4rem] border border-cyan-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">{copy.water}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{(waterMl / 1000).toFixed(1)}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.ofGoal} {(waterGoal / 1000).toFixed(1)} L</p>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-200/70 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{copy.steps}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{stepCount.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{copy.ofGoal} {stepGoal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Right mascot panel */}
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(219,234,254,0.74))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.74))]">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),rgba(255,255,255,0)_72%)] p-3">
                  <MascotRobot size={170} />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.quickPrompts}</p>
                  {quickQuestions.slice(0, 3).map((question) => (
                    <button
                      key={question}
                      onClick={() => sendMessage(question)}
                      className="w-full rounded-[1.1rem] border border-white/70 bg-white/86 px-3 py-2.5 text-left text-xs text-slate-600 transition hover:border-[#1A6BFF]/35 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────────────────── */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">

          {/* Sticky sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">

            {/* Today's intake */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{copy.todaysIntake}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{Math.round(caloriesToday)} {copy.kcalConsumed}</h2>
              <div className="mt-4 space-y-2">
                {todayLogs.length === 0 ? (
                  <p className="rounded-[1.1rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    {copy.noFood}
                  </p>
                ) : (
                  todayLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between rounded-[1.1rem] border border-white/60 bg-white/76 px-3 py-2.5 text-sm dark:border-white/8 dark:bg-white/4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{log.food_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{log.meal_type} · {log.quantity}{log.unit}</p>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{Math.round(log.calories)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Water tracker */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets size={15} className="text-cyan-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">{copy.hydration}</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{(waterMl / 1000).toFixed(2)} / {(waterGoal / 1000).toFixed(1)} L</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[250, 500].map((ml) => (
                  <Button key={ml} onClick={() => upsertWellness({ water_ml: Math.max(0, waterMl + ml) })} variant="outline" className="flex-1 h-10 rounded-[0.9rem] border-cyan-200/80 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-semibold">
                    <Plus size={12} className="mr-1" />{ml} ml
                  </Button>
                ))}
                <Button onClick={() => upsertWellness({ water_ml: 0 })} disabled={waterMl === 0} variant="ghost" className="h-10 w-10 rounded-[0.9rem] text-slate-400 hover:text-rose-500 shrink-0">
                  <Minus size={14} />
                </Button>
              </div>
            </div>

            {/* Step tracker */}
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Footprints size={15} className="text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{copy.steps}</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stepCount.toLocaleString()} / {stepGoal.toLocaleString()}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Input
                  type="number"
                  placeholder={copy.addSteps}
                  value={stepInput}
                  onChange={(e) => setStepInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt(stepInput, 10);
                      if (Number.isFinite(value)) {
                        upsertWellness({ step_count: Math.max(0, stepCount + value) });
                        setStepInput('');
                      }
                    }
                  }}
                  className="h-10 flex-1 rounded-[0.9rem] input-glow text-sm"
                />
                <Button
                  onClick={() => {
                    const value = parseInt(stepInput, 10);
                    if (!Number.isFinite(value)) return;
                    upsertWellness({ step_count: Math.max(0, stepCount + value) });
                    setStepInput('');
                  }}
                  disabled={!stepInput}
                  className="h-10 rounded-[0.9rem] bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </aside>

          {/* Chat window */}
          <div className="rounded-[2rem] border border-white/70 bg-white/84 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 flex flex-col">
            <div className="border-b border-white/60 px-5 py-4 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">{copy.conversation}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{copy.oneThread}</h2>
            </div>
            <div className="max-h-[68vh] overflow-y-auto px-4 py-5 md:px-6">
              {messages.length === 0 ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                  <MascotRobot size={90} />
                  <h3 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">{copy.coachable}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {copy.receipts}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[92%] space-y-3 md:max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-[1.7rem] px-4 py-3 text-sm leading-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${message.role === 'user' ? 'rounded-tr-md bg-[linear-gradient(135deg,#0F5FE8,#2E8BFF)] text-white' : 'rounded-tl-md border border-white/60 bg-white/86 text-slate-800 dark:border-white/8 dark:bg-white/6 dark:text-slate-100'}`}>
                          {message.content}
                        </div>

                        {message.foodDraft && (
                          <div className="rounded-[1.5rem] border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.88))] p-4 shadow-[0_18px_60px_rgba(16,185,129,0.10)] dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(15,23,42,0.74))]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                <Apple size={16} />
                                <span className="text-sm font-semibold">{copy.mealReceipt}</span>
                              </div>
                              {message.foodDraftApplied ? (
                                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                  <CheckCircle2 size={14} />
                                  {copy.saved}
                                </div>
                              ) : (
                                <button onClick={() => setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, foodDraft: null } : m)))} className="rounded-full p-2 text-slate-500 hover:bg-white/60 dark:hover:bg-white/8">
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            <div className="mt-4 space-y-3">
                              {message.foodDraft.map((item, index) => (
                                <div key={`${message.id}-${index}`} className="rounded-[1.15rem] border border-white/60 bg-white/76 p-3 dark:border-white/8 dark:bg-white/4">
                                  <div className="mb-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <PencilLine size={14} />
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Item {index + 1}</span>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <Input value={item.name} onChange={(e) => updateDraftItem(message.id, index, 'name', e.target.value)} className="input-glow rounded-xl" />
                                    <select value={item.meal_type || 'snacks'} onChange={(e) => updateDraftItem(message.id, index, 'meal_type', e.target.value)} className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3 text-sm text-foreground input-glow">
                                      {mealTypes.map((mealType) => (
                                        <option key={mealType} value={mealType}>{mealType}</option>
                                      ))}
                                    </select>
                                    <Input type="number" value={item.quantity} onChange={(e) => updateDraftItem(message.id, index, 'quantity', Number(e.target.value))} className="input-glow rounded-xl" />
                                    <Input value={item.unit} onChange={(e) => updateDraftItem(message.id, index, 'unit', e.target.value)} className="input-glow rounded-xl" />
                                  </div>
                                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                      ['calories', item.calories],
                                      ['protein', item.protein],
                                      ['carbs', item.carbs],
                                      ['fat', item.fat],
                                    ].map(([field, value]) => (
                                      <Input key={field} type="number" value={value} onChange={(e) => updateDraftItem(message.id, index, field as keyof FoodItem, Number(e.target.value))} className="input-glow rounded-xl" />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 flex flex-col gap-3 border-t border-emerald-500/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                  <Flame size={14} className="text-emerald-600" />
                                  {message.foodDraft.reduce((sum, item) => sum + item.calories, 0)} kcal total
                                </div>
                                {message.foodDraftError && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{message.foodDraftError}</p>}
                              </div>
                              {!message.foodDraftApplied && (
                                <Button onClick={() => applyFoodDraft(message.id, message.foodDraft || [])} disabled={applyingFood === message.id} className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                                  {applyingFood === message.id ? copy.saving : copy.saveToday}
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {message.exerciseDraft && !message.exerciseDraftApplied && (
                          <div className="rounded-[1.5rem] border border-violet-500/20 bg-violet-500/5 p-4">
                            <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300">
                              <Dumbbell size={16} />
                              <span className="text-sm font-semibold">{copy.exerciseDraft}</span>
                            </div>
                            <div className="mt-3 space-y-2">
                              {message.exerciseDraft.map((item, index) => (
                                <div key={`${message.id}-exercise-${index}`} className="flex items-center justify-between text-sm">
                                  <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.category} · {item.duration} min</p>
                                  </div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{item.calories_burned} kcal</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="border-t border-white/60 px-4 py-4 dark:border-white/10 md:px-6">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}>
                <div className="flex items-center gap-3 rounded-[1.7rem] border border-white/70 bg-white/86 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] bg-[linear-gradient(135deg,#0F5FE8,#54A2FF)] text-white shadow-[0_12px_30px_rgba(26,107,255,0.32)]">
                    <Sparkles size={18} />
                  </div>
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={t(language, 'chat.placeholder')} disabled={isLoading} className="h-12 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()} className="h-12 rounded-[1.15rem] bg-slate-950 px-4 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <ArrowUp size={18} />
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
