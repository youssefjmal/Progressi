'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import { Eye, EyeOff, Dumbbell, Flame, Scale, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 1 | 2 | 3;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  currentWeight: string;
  height: string;
  goalWeight: string;
  activityLevel: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | '';
  primaryGoal: 'loseWeight' | 'maintain' | 'buildMuscle' | '';
  workoutDays: number;
  language: Language;
}

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
};

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calculateCalories(data: FormData): number {
  const weight = parseFloat(data.currentWeight) || 0;
  const height = parseFloat(data.height) || 0;
  const age = calculateAge(data.dateOfBirth);
  const factor = ACTIVITY_FACTORS[data.activityLevel] || 1.2;

  if (!weight || !height || !age) return 0;

  // Mifflin-St Jeor
  let bmr: number;
  if (data.gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = Math.round(bmr * factor);

  if (data.primaryGoal === 'loseWeight') return Math.max(tdee - 500, 1200);
  if (data.primaryGoal === 'buildMuscle') return tdee + 300;
  return tdee;
}

export default function SignUpPage() {
  const router = useRouter();
  const { language: appLanguage } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    currentWeight: '',
    height: '',
    goalWeight: '',
    activityLevel: '',
    primaryGoal: '',
    workoutDays: 3,
    language: appLanguage,
  });

  const lang = appLanguage;

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError('Please fill in all fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.dateOfBirth || !form.gender || !form.currentWeight || !form.height || !form.goalWeight) {
        setError('Please fill in all fields.');
        return;
      }
      setStep(3);
    }
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.activityLevel || !form.primaryGoal) {
      setError('Please complete all selections.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const calorieTarget = calculateCalories(form);
      const age = calculateAge(form.dateOfBirth);

      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            language: form.language,
            age,
            gender: form.gender,
            height: parseFloat(form.height),
            current_weight: parseFloat(form.currentWeight),
            goal_weight: parseFloat(form.goalWeight),
            activity_level: form.activityLevel,
            primary_goal: form.primaryGoal,
            workout_days: form.workoutDays,
            calorie_target: calorieTarget,
          },
        },
      });

      if (error) throw error;
      localStorage.setItem('language', form.language);
      router.push('/auth/sign-up-success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const calorieTarget = step === 3 ? calculateCalories(form) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] dark:bg-[#0A0A0F] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#1A6BFF]">Coachini</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === 1
              ? t(lang, 'auth.step1of3')
              : step === 2
              ? t(lang, 'auth.step2of3')
              : t(lang, 'auth.step3of3')}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1A6BFF] rounded-full"
              animate={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className={step >= 1 ? 'text-[#1A6BFF] font-medium' : ''}>Account</span>
            <span className={step >= 2 ? 'text-[#1A6BFF] font-medium' : ''}>Body Profile</span>
            <span className={step >= 3 ? 'text-[#1A6BFF] font-medium' : ''}>Goals</span>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-8 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <motion.div
                key={1}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleNext} className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {t(lang, 'auth.createAccount')}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t(lang, 'profile.firstName')}</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => update('firstName', e.target.value)}
                        placeholder="Ahmed"
                        className="input-glow"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t(lang, 'profile.lastName')}</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => update('lastName', e.target.value)}
                        placeholder="Ben Ali"
                        className="input-glow"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t(lang, 'auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="ahmed@example.com"
                      className="input-glow"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t(lang, 'auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        className="input-glow pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm">{t(lang, 'auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        className="input-glow pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full gradient-btn py-3 rounded-xl">
                    {t(lang, 'auth.continue')}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {t(lang, 'auth.alreadyHave')}{' '}
                    <Link href="/auth/login" className="text-[#1A6BFF] font-semibold hover:underline">
                      {t(lang, 'auth.signIn')}
                    </Link>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <motion.div
                key={2}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleNext} className="space-y-5">
                  <h2 className="text-xl font-bold text-foreground mb-2">Body Profile</h2>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dob">{t(lang, 'auth.dateOfBirth')}</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="dob"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => update('dateOfBirth', e.target.value)}
                        className="input-glow flex-1"
                        required
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {form.dateOfBirth && (
                        <span className="text-sm font-semibold text-[#1A6BFF] whitespace-nowrap">
                          Age: {calculateAge(form.dateOfBirth)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>{t(lang, 'auth.gender')}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['male', 'female'] as const).map((g) => (
                        <motion.button
                          key={g}
                          type="button"
                          onClick={() => update('gender', g)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                            form.gender === g
                              ? 'border-[#1A6BFF] bg-[#1A6BFF]/10 text-[#1A6BFF]'
                              : 'border-border text-muted-foreground hover:border-[#1A6BFF]/40'
                          }`}
                        >
                          <span className="block text-2xl mb-1">{g === 'male' ? '♂' : '♀'}</span>
                          {t(lang, `auth.${g}`)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Weight / Height / Goal */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">{t(lang, 'auth.currentWeight')}</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="30"
                        max="300"
                        value={form.currentWeight}
                        onChange={(e) => update('currentWeight', e.target.value)}
                        placeholder="75"
                        className="input-glow"
                        required
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">{t(lang, 'auth.height')}</Label>
                      <Input
                        id="height"
                        type="number"
                        step="1"
                        min="100"
                        max="250"
                        value={form.height}
                        onChange={(e) => update('height', e.target.value)}
                        placeholder="175"
                        className="input-glow"
                        required
                      />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalWeight">{t(lang, 'auth.goalWeight')}</Label>
                      <Input
                        id="goalWeight"
                        type="number"
                        step="0.1"
                        min="30"
                        max="300"
                        value={form.goalWeight}
                        onChange={(e) => update('goalWeight', e.target.value)}
                        placeholder="70"
                        className="input-glow"
                        required
                      />
                      <span className="text-xs text-muted-foreground">kg</span>
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setError(null); setStep(1); }}
                      className="flex-1"
                    >
                      {t(lang, 'auth.back')}
                    </Button>
                    <Button type="submit" className="flex-1 gradient-btn rounded-xl">
                      {t(lang, 'auth.continue')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 3 ─── */}
            {step === 3 && (
              <motion.div
                key={3}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleFinish} className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">Activity and Goals</h2>

                  {/* Activity Level */}
                  <div className="space-y-2">
                    <Label>{t(lang, 'auth.activityLevel')}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          { key: 'sedentary', icon: Scale, desc: 'Desk job, little exercise' },
                          { key: 'lightlyActive', icon: Activity, desc: '1-3 days/week' },
                          { key: 'moderatelyActive', icon: Zap, desc: '3-5 days/week' },
                          { key: 'veryActive', icon: Flame, desc: '6-7 days/week' },
                        ] as const
                      ).map(({ key, icon: Icon, desc }) => (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => update('activityLevel', key)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            form.activityLevel === key
                              ? 'border-[#1A6BFF] bg-[#1A6BFF]/10'
                              : 'border-border hover:border-[#1A6BFF]/40'
                          }`}
                        >
                          <Icon
                            size={18}
                            className={`mb-1 ${form.activityLevel === key ? 'text-[#1A6BFF]' : 'text-muted-foreground'}`}
                          />
                          <p className={`text-sm font-semibold ${form.activityLevel === key ? 'text-[#1A6BFF]' : 'text-foreground'}`}>
                            {t(lang, `auth.${key}`)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Primary Goal */}
                  <div className="space-y-2">
                    <Label>{t(lang, 'auth.primaryGoal')}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { key: 'loseWeight', icon: Flame },
                          { key: 'maintain', icon: Scale },
                          { key: 'buildMuscle', icon: Dumbbell },
                        ] as const
                      ).map(({ key, icon: Icon }) => (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => update('primaryGoal', key)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            form.primaryGoal === key
                              ? 'border-[#1A6BFF] bg-[#1A6BFF]/10'
                              : 'border-border hover:border-[#1A6BFF]/40'
                          }`}
                        >
                          <Icon
                            size={20}
                            className={`mx-auto mb-1 ${form.primaryGoal === key ? 'text-[#1A6BFF]' : 'text-muted-foreground'}`}
                          />
                          <p className={`text-xs font-semibold ${form.primaryGoal === key ? 'text-[#1A6BFF]' : 'text-foreground'}`}>
                            {t(lang, `auth.${key}`)}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Workout days */}
                  <div className="space-y-2">
                    <Label>{t(lang, 'auth.workoutDays')}: <span className="text-[#1A6BFF] font-bold">{form.workoutDays}</span></Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => update('workoutDays', d)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                            form.workoutDays === d
                              ? 'bg-[#1A6BFF] text-white'
                              : 'bg-muted text-muted-foreground hover:bg-[#1A6BFF]/20 hover:text-[#1A6BFF]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calorie target result */}
                  {calorieTarget > 0 && (
                    <div className="rounded-xl p-4 border-2 border-[#1A6BFF]/40 bg-[#1A6BFF]/5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                        {t(lang, 'auth.calorieTarget')}
                      </p>
                      <p className="text-3xl font-extrabold text-[#1A6BFF]">
                        {calorieTarget.toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground ml-1">kcal/day</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Calculated using Mifflin-St Jeor formula
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setError(null); setStep(2); }}
                      className="flex-1"
                    >
                      {t(lang, 'auth.back')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 gradient-btn rounded-xl"
                    >
                      {isLoading ? 'Creating account...' : t(lang, 'auth.finish')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
