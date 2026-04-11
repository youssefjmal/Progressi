'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const copy = {
  en: {
    title: 'Set New Password',
    subtitle: 'Choose a strong password for your account',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    mismatch: 'Passwords do not match',
    tooShort: 'Password must be at least 8 characters',
    submit: 'Update Password',
    submitting: 'Updating...',
    success: 'Password updated! Redirecting...',
    error: 'Failed to update password',
  },
  fr: {
    title: 'Nouveau mot de passe',
    subtitle: 'Choisissez un mot de passe fort pour votre compte',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    mismatch: 'Les mots de passe ne correspondent pas',
    tooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    submit: 'Mettre à jour',
    submitting: 'Mise à jour...',
    success: 'Mot de passe mis à jour ! Redirection...',
    error: 'Échec de la mise à jour du mot de passe',
  },
  ar: {
    title: 'تعيين كلمة مرور جديدة',
    subtitle: 'اختر كلمة مرور قوية لحسابك',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    mismatch: 'كلمتا المرور غير متطابقتين',
    tooShort: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل',
    submit: 'تحديث كلمة المرور',
    submitting: 'جارٍ التحديث...',
    success: 'تم تحديث كلمة المرور! جارٍ التحويل...',
    error: 'فشل تحديث كلمة المرور',
  },
} as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Detect language from localStorage (same pattern as the app)
  const lang = (typeof window !== 'undefined'
    ? (localStorage.getItem('language') as 'en' | 'fr' | 'ar') ?? 'en'
    : 'en') as keyof typeof copy;
  const c = copy[lang] ?? copy.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(c.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(c.mismatch);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push('/calories'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : c.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] dark:bg-[#0A0A0F] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1A6BFF]">Progressi</h1>
          <p className="text-muted-foreground mt-2">{c.subtitle}</p>
        </div>

        <motion.div
          className="bg-background rounded-2xl border border-border p-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-6">{c.title}</h2>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="text-green-500" size={48} />
              <p className="text-sm text-muted-foreground">{c.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">{c.newPassword}</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-glow pr-10"
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
                <Label htmlFor="confirm-password">{c.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-glow pr-10"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-btn py-3 rounded-xl"
              >
                {isLoading ? c.submitting : c.submit}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
