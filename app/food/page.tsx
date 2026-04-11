'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Apple, Flame, Plus, Search, Soup, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { localDateString } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { t, type Language } from '@/lib/i18n';

const foodPageCopy: Record<Language, Record<string, string>> = {
  en: {
    heroHeading: 'A meal logger that is easier to scan and faster to use.',
    heroSub: 'Review each meal, track macros, and add foods from your own catalog or USDA without fighting a cramped mobile layout.',
    consumed: 'Consumed', kcalToday: 'kcal today',
    remaining: 'Remaining', kcalLeft: 'kcal left',
    logged: 'Logged', foodEntries: 'food entries',
  },
  fr: {
    heroHeading: 'Un journal alimentaire plus simple à scanner et plus rapide à utiliser.',
    heroSub: 'Consultez chaque repas, suivez les macros et ajoutez des aliments depuis votre catalogue ou USDA sans interface encombrée.',
    consumed: 'Consommées', kcalToday: 'kcal aujourd\'hui',
    remaining: 'Restant', kcalLeft: 'kcal restantes',
    logged: 'Enregistré', foodEntries: 'aliments enregistrés',
  },
  ar: {
    heroHeading: 'سجل وجباتك بسهولة وسرعة أكبر.',
    heroSub: 'راجع كل وجبة وتابع المغذيات وأضف الأطعمة من قاعدة بياناتك أو USDA بدون تعقيد.',
    consumed: 'المستهلك', kcalToday: 'سعرة اليوم',
    remaining: 'المتبقي', kcalLeft: 'سعرة متبقية',
    logged: 'المسجل', foodEntries: 'وجبات مسجلة',
  },
};
import { MascotChef } from '@/components/mascots/mascot';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  source?: 'usda';
}

interface LoggedFood {
  id: string;
  food_id: string;
  meal_type: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food_name: string;
}

interface ProfileTargets {
  calorie_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fat_target: number | null;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

const MEAL_META = {
  breakfast: { icon: Soup, accent: '#F59E0B' },
  lunch: { icon: Apple, accent: '#1A6BFF' },
  dinner: { icon: Soup, accent: '#8B5CF6' },
  snacks: { icon: Apple, accent: '#10B981' },
} as const;

function ProgressRow({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const width = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {Math.round(current)} / {target}
          {label === 'Calories' ? ' kcal' : ' g'}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.7 }} />
      </div>
    </div>
  );
}

export default function FoodPage() {
  const { user, isLoading: authLoading, supabase } = useRequireAuth();
  const { language } = useLanguage();
  const copy = foodPageCopy[language];
  const [foods, setFoods] = useState<Food[]>([]);
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [targets, setTargets] = useState<ProfileTargets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealForModal, setActiveMealForModal] = useState<string>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [isAdding, setIsAdding] = useState(false);
  const [usdaFoods, setUsdaFoods] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const today = localDateString();
    const [foodsRes, logsRes, profileRes] = await Promise.all([
      supabase.from('foods').select('*').order('name'),
      supabase.from('food_logs').select('*').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`).lte('logged_at', `${today}T23:59:59`).order('logged_at', { ascending: false }),
      supabase.from('profiles').select('calorie_target,protein_target,carbs_target,fat_target').eq('id', user.id).maybeSingle(),
    ]);

    const foodsData = foodsRes.data || [];
    const logsData = logsRes.data || [];
    setFoods(foodsData);
    setTargets(profileRes.data || null);
    setLoggedFoods(
      logsData.map((log) => {
        const match = foodsData.find((food) => food.id === (log as { food_id: string }).food_id);
        return { ...(log as Omit<LoggedFood, 'food_name'>), food_name: match?.name || 'Unknown food' };
      }),
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setUsdaFoods([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setUsdaFoods(data.foods || []);
      } catch {
        setUsdaFoods([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totals = useMemo(
    () => ({
      calories: loggedFoods.reduce((sum, item) => sum + item.calories, 0),
      protein: loggedFoods.reduce((sum, item) => sum + item.protein, 0),
      carbs: loggedFoods.reduce((sum, item) => sum + item.carbs, 0),
      fat: loggedFoods.reduce((sum, item) => sum + item.fat, 0),
    }),
    [loggedFoods],
  );

  const calorieGoal = targets?.calorie_target ?? 2000;
  const proteinGoal = targets?.protein_target ?? 140;
  const carbsGoal = targets?.carbs_target ?? 220;
  const fatGoal = targets?.fat_target ?? 70;
  const completion = calorieGoal > 0 ? Math.min((totals.calories / calorieGoal) * 100, 100) : 0;
  const remaining = Math.max(0, calorieGoal - totals.calories);
  const filteredFoods = foods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const mealItems = (meal: string) => loggedFoods.filter((item) => item.meal_type === meal);

  const handleAddFood = async () => {
    if (!selectedFood || !user) return;
    setIsAdding(true);
    try {
      let foodId = selectedFood.id;
      if (selectedFood.source === 'usda') {
        const { data: existing } = await supabase.from('foods').select('id').ilike('name', selectedFood.name).maybeSingle();
        if (existing) {
          foodId = existing.id;
        } else {
          const { data: inserted } = await supabase
            .from('foods')
            .insert({
              name: selectedFood.name,
              calories: selectedFood.calories,
              protein: selectedFood.protein,
              carbs: selectedFood.carbs,
              fat: selectedFood.fat,
              serving_size: selectedFood.serving_size,
              serving_unit: selectedFood.serving_unit,
            })
            .select('id')
            .single();
          if (inserted) {
            foodId = inserted.id;
            setFoods((prev) => [...prev, { ...selectedFood, id: inserted.id, source: undefined }]);
          }
        }
      }

      const qty = parseFloat(quantity) || 100;
      const multiplier = qty / (selectedFood.serving_size || 100);

      await supabase.from('food_logs').insert({
        user_id: user.id,
        food_id: foodId,
        meal_type: activeMealForModal,
        quantity: qty,
        unit: selectedFood.serving_unit,
        calories: Math.round(selectedFood.calories * multiplier * 10) / 10,
        protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
        carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
        fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      });

      setModalOpen(false);
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity('100');
      await loadData();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id);
    setLoggedFoods((prev) => prev.filter((item) => item.id !== id));
  };

  if (authLoading || isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6BFF] border-t-transparent" /></div>;
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-28 dark:bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ── Mobile compact header ───────────────────────────── */}
        <div className="sm:hidden mb-4">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{t(language, 'food.title')}</h1>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-blue-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-xl font-black text-slate-950 dark:text-white">{Math.round(totals.calories)}</p>
              <p className="text-[10px] font-semibold text-[#1A6BFF] uppercase tracking-wide">kcal</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-xl font-black text-slate-950 dark:text-white">{remaining}</p>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">left</p>
            </div>
            <div className="rounded-2xl border border-violet-200/70 bg-white/90 p-3 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-xl font-black text-slate-950 dark:text-white">{Math.round(completion)}%</p>
              <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide">done</p>
            </div>
          </div>
          {/* Mobile quick-add row */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MEAL_TYPES.map((meal) => (
              <button key={meal} type="button"
                onClick={() => { setActiveMealForModal(meal); setModalOpen(true); setSelectedFood(null); setSearchQuery(''); setQuantity('100'); }}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-2xl border border-[#1A6BFF]/30 bg-[#1A6BFF]/8 px-4 py-2.5 text-sm font-semibold text-[#1A6BFF]"
              >
                <Plus size={14} />{t(language, `food.${meal}`)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop hero ────────────────────────────────────── */}
        <section className="hidden sm:block rounded-[2.2rem] border border-white/70 bg-white/78 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1A6BFF]">{t(language, 'food.title')}</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">{copy.heroHeading}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">{copy.heroSub}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-blue-200/70 bg-white/88 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">{copy.consumed}</p><p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(totals.calories)}</p><p className="text-sm text-slate-500 dark:text-slate-400">{copy.kcalToday}</p></div>
                <div className="rounded-[1.4rem] border border-emerald-200/70 bg-white/88 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{copy.remaining}</p><p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{remaining}</p><p className="text-sm text-slate-500 dark:text-slate-400">{copy.kcalLeft}</p></div>
                <div className="rounded-[1.4rem] border border-violet-200/70 bg-white/88 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">{copy.logged}</p><p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{loggedFoods.length}</p><p className="text-sm text-slate-500 dark:text-slate-400">{copy.foodEntries}</p></div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(219,234,254,0.74))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(30,41,59,0.74))]">
              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-center rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.24),rgba(255,255,255,0)_72%)] p-3"><MascotChef size={170} /></div>
                <div className="space-y-4">
                  <div className="rounded-[1.3rem] border border-white/75 bg-white/88 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">Daily target</p><p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{calorieGoal} kcal</p></div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#1A6BFF] text-sm font-bold text-[#1A6BFF]">{completion.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5"><p className="text-lg font-bold text-[#3B82F6]">{Math.round(totals.protein)}g</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t(language, 'food.protein')}</p></div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5"><p className="text-lg font-bold text-[#10B981]">{Math.round(totals.carbs)}g</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t(language, 'food.carbs')}</p></div>
                    <div className="rounded-[1.1rem] border border-white/70 bg-white/86 p-3 text-center dark:border-white/10 dark:bg-white/5"><p className="text-lg font-bold text-[#F59E0B]">{Math.round(totals.fat)}g</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t(language, 'food.fat')}</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start order-2 xl:order-1 hidden sm:block">
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{t(language, 'food.todaysTotals')}</p>
              <div className="mt-5 space-y-4">
                <ProgressRow label="Calories" current={totals.calories} target={calorieGoal} color="#1A6BFF" />
                <ProgressRow label="Protein" current={totals.protein} target={proteinGoal} color="#3B82F6" />
                <ProgressRow label="Carbs" current={totals.carbs} target={carbsGoal} color="#10B981" />
                <ProgressRow label="Fat" current={totals.fat} target={fatGoal} color="#F59E0B" />
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Quick add</p>
              <div className="mt-4 space-y-3">
                {MEAL_TYPES.map((meal) => (
                  <Button key={meal} variant="outline" onClick={() => { setActiveMealForModal(meal); setModalOpen(true); setSelectedFood(null); setSearchQuery(''); setQuantity('100'); }} className="h-12 w-full justify-between rounded-[1rem] border-slate-200/80 bg-white/90 px-4 hover:border-[#1A6BFF] hover:bg-[#1A6BFF]/5 dark:border-white/10 dark:bg-white/5">
                    <span>{t(language, `food.${meal}`)}</span>
                    <Plus size={16} />
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-5 order-1 xl:order-2">
            {MEAL_TYPES.map((meal) => {
              const items = mealItems(meal);
              const meta = MEAL_META[meal];
              const Icon = meta.icon;
              const mealCalories = Math.round(items.reduce((sum, item) => sum + item.calories, 0));
              return (
                <section key={meal} className="rounded-[2rem] border border-white/70 bg-white/84 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${meta.accent}15`, color: meta.accent }}><Icon size={20} /></div>
                      <div><p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>{t(language, `food.${meal}`)}</p><h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">{mealCalories} kcal</h2></div>
                    </div>
                    <Button onClick={() => { setActiveMealForModal(meal); setModalOpen(true); setSelectedFood(null); setSearchQuery(''); setQuantity('100'); }} className="h-11 rounded-full bg-[#1A6BFF] px-5 text-white hover:bg-[#1456d1]"><Plus size={16} className="mr-2" />{t(language, 'food.addFood')}</Button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {items.length === 0 ? (
                      <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{t(language, 'food.noFoods')}</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {items.map((item) => (
                          <motion.div key={item.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.84))] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.74),rgba(15,23,42,0.86))]">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-semibold text-slate-950 dark:text-white">{item.food_name}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.quantity}{item.unit} logged</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="grid grid-cols-2 gap-2 sm:flex">
                                  {[{label:'kcal',value:Math.round(item.calories),color:'#1A6BFF'},{label:'P',value:Math.round(item.protein),color:'#3B82F6'},{label:'C',value:Math.round(item.carbs),color:'#10B981'},{label:'F',value:Math.round(item.fat),color:'#F59E0B'}].map((stat) => (
                                    <div key={stat.label} className="min-w-[62px] rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-center dark:border-white/10 dark:bg-white/5"><p className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{stat.label}</p></div>
                                  ))}
                                </div>
                                <button type="button" onClick={() => handleDelete(item.id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setSelectedFood(null); setSearchQuery(''); setQuantity('100'); setUsdaFoods([]); } }}>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-0 shadow-[0_40px_120px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950">
            <DialogHeader className="border-b border-slate-200/80 px-5 pb-3 pt-5 dark:border-white/10">
              <div className="flex items-center gap-3">
                {selectedFood && (
                  <button type="button" onClick={() => setSelectedFood(null)} className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    ←
                  </button>
                )}
                <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">{t(language, 'food.addFood')} — {t(language, `food.${activeMealForModal}`)}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className={`border-b border-slate-200/80 p-5 dark:border-white/10 lg:border-b-0 lg:border-r ${selectedFood ? 'hidden lg:block' : 'block'}`}>
                <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input placeholder={t(language, 'food.searchPlaceholder')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedFood(null); }} className="h-12 rounded-2xl border-slate-200/80 pl-11 input-glow" /></div>
                <div className="mt-4 max-h-[58vh] space-y-2 overflow-y-auto pr-1">
                  {searchQuery ? (
                    <>
                      {filteredFoods.slice(0, 8).map((food) => (
                        <button key={food.id} type="button" onClick={() => setSelectedFood(food)} className={`w-full rounded-[1.2rem] border p-4 text-left ${selectedFood?.id === food.id ? 'border-[#1A6BFF] bg-[#1A6BFF]/8' : 'border-slate-200/80 bg-white hover:border-[#1A6BFF]/40 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5'}`}>
                          <p className="font-semibold text-slate-950 dark:text-white">{food.name}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{food.calories} kcal per {food.serving_size}{food.serving_unit}</p>
                        </button>
                      ))}
                      {isSearching && <div className="flex items-center justify-center gap-3 py-8 text-sm text-slate-500 dark:text-slate-400"><div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1A6BFF] border-t-transparent" />Searching USDA database...</div>}
                      {!isSearching && usdaFoods.slice(0, 10).map((food) => (
                        <button key={food.id} type="button" onClick={() => setSelectedFood(food)} className={`w-full rounded-[1.2rem] border p-4 text-left ${selectedFood?.id === food.id ? 'border-[#1A6BFF] bg-[#1A6BFF]/8' : 'border-slate-200/80 bg-white hover:border-[#1A6BFF]/40 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5'}`}>
                          <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950 dark:text-white">{food.name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{food.calories} kcal per {food.serving_size}{food.serving_unit}</p></div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">USDA</span></div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center dark:border-white/10 dark:bg-white/5"><p className="text-base font-semibold text-slate-900 dark:text-white">Search foods to start</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Look in your local catalog first, then fall back to USDA.</p></div>
                  )}
                </div>
              </div>
              <div className={`bg-[linear-gradient(180deg,#eff6ff,#ffffff)] p-5 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.84),rgba(15,23,42,0.94))] ${selectedFood ? 'block' : 'hidden lg:block'}`}>
                {selectedFood ? (
                  <div className="space-y-4">
                    <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-lg font-bold text-slate-950 dark:text-white">{selectedFood.name}</p>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedFood.calories} kcal per {selectedFood.serving_size}{selectedFood.serving_unit}</p>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-white/5"><p className="text-sm font-bold text-[#3B82F6]">{selectedFood.protein}g</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Protein</p></div>
                        <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-white/5"><p className="text-sm font-bold text-[#10B981]">{selectedFood.carbs}g</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Carbs</p></div>
                        <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-white/5"><p className="text-sm font-bold text-[#F59E0B]">{selectedFood.fat}g</p><p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Fat</p></div>
                      </div>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/80 bg-white/90 p-4 dark:border-white/10 dark:bg-white/5">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">{t(language, 'food.quantity')} ({selectedFood.serving_unit})</label>
                      <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-3 h-12 rounded-2xl border-slate-200/80 input-glow" />
                      <div className="mt-4 rounded-[1.2rem] border border-[#1A6BFF]/10 bg-[#1A6BFF]/5 p-4">
                        <div className="flex items-center gap-2 text-[#1A6BFF]"><Flame size={16} /><span className="text-sm font-semibold">Live preview</span></div>
                        <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{Math.round(selectedFood.calories * ((parseFloat(quantity) || 0) / (selectedFood.serving_size || 100)))} kcal</p>
                      </div>
                    </div>
                    <Button onClick={handleAddFood} disabled={isAdding} className="h-12 w-full rounded-2xl bg-[#1A6BFF] text-white hover:bg-[#1456d1]">{isAdding ? 'Adding...' : t(language, 'food.addToMeal')}</Button>
                  </div>
                ) : (
                  <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-white/70 px-5 py-14 text-center dark:border-white/10 dark:bg-white/5"><p className="text-base font-semibold text-slate-900 dark:text-white">Pick a food from the list</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The portion preview will appear here.</p></div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
