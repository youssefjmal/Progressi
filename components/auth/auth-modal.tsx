'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthModal } from '@/lib/auth-modal-context';
import { useLanguage } from '@/hooks/use-language';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const supabase = createClient();

const modalCopy = {
  en: {
    loginFailed: 'Login failed',
    signupFailed: 'Signup failed',
    signingIn: 'Signing in...',
    creating: 'Creating account...',
    checkEmail: 'Check your email!',
    confirmationSent: 'We sent a confirmation link to',
    confirmationAction: 'Click it to activate your account.',
    backToSignIn: 'Back to Sign In',
    // Forgot password
    forgotTitle: 'Reset your password',
    forgotSubtitle: "Enter your email and we'll send a reset link",
    sendLink: 'Send Reset Link',
    sending: 'Sending...',
    emailSent: 'Reset link sent! Check your inbox.',
    noAccount: 'No account found with this email.',
    unknownError: 'An error occurred',
  },
  fr: {
    loginFailed: 'Échec de la connexion',
    signupFailed: "Échec de l'inscription",
    signingIn: 'Connexion...',
    creating: 'Création du compte...',
    checkEmail: 'Vérifiez votre e-mail !',
    confirmationSent: 'Nous avons envoyé un lien de confirmation à',
    confirmationAction: 'Cliquez dessus pour activer votre compte.',
    backToSignIn: 'Retour à la connexion',
    forgotTitle: 'Réinitialiser votre mot de passe',
    forgotSubtitle: 'Entrez votre e-mail pour recevoir un lien de réinitialisation',
    sendLink: 'Envoyer le lien',
    sending: 'Envoi...',
    emailSent: 'Lien envoyé ! Vérifiez votre boîte mail.',
    noAccount: 'Aucun compte trouvé avec cet e-mail.',
    unknownError: 'Une erreur est survenue',
  },
  ar: {
    loginFailed: 'فشل تسجيل الدخول',
    signupFailed: 'فشل إنشاء الحساب',
    signingIn: 'جارٍ تسجيل الدخول...',
    creating: 'جارٍ إنشاء الحساب...',
    checkEmail: 'تحقق من بريدك الإلكتروني',
    confirmationSent: 'لقد أرسلنا رابط التأكيد إلى',
    confirmationAction: 'اضغط عليه لتفعيل حسابك.',
    backToSignIn: 'العودة إلى تسجيل الدخول',
    forgotTitle: 'إعادة تعيين كلمة المرور',
    forgotSubtitle: 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين',
    sendLink: 'إرسال الرابط',
    sending: 'جارٍ الإرسال...',
    emailSent: 'تم إرسال الرابط! تحقق من بريدك.',
    noAccount: 'لم يتم العثور على حساب بهذا البريد.',
    unknownError: 'حدث خطأ',
  },
} as const;

export function AuthModal() {
  const { isOpen, view, openLogin, openSignup, close } = useAuthModal();
  const { language } = useLanguage();
  const router = useRouter();
  const copy = modalCopy[language];

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password state
  const [modalView, setModalView] = useState<'default' | 'forgot'>('default');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      close();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    setSignupError(null);
    try {
      const [firstName, ...rest] = signupName.trim().split(' ');
      const lastName = rest.join(' ') || '';
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });
      if (error) throw error;
      router.push('/calories');
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : copy.signupFailed);
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setIsSending(true);
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const { exists } = await res.json();
      if (!exists) {
        setForgotError(copy.noAccount);
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setForgotSuccess(true);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : copy.unknownError);
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setEmail(''); setPassword(''); setError(null);
    setSignupEmail(''); setSignupPassword(''); setSignupName('');
    setSignupError(null); setSignupSuccess(false);
    setShowPassword(false); setShowSignupPassword(false);
    setModalView('default'); setForgotEmail(''); setForgotError(null); setForgotSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => { close(); reset(); }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
          initial={{ scale: 0.92, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* Close */}
          <button
            onClick={() => { close(); reset(); }}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>

          {/* Tab switcher */}
          <div className="flex border-b border-border">
            {(['login', 'signup'] as const).map((v) => (
              <button
                key={v}
                onClick={() => { v === 'login' ? openLogin() : openSignup(); reset(); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                  view === v
                    ? 'text-[#1A6BFF] border-b-2 border-[#1A6BFF]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'login' ? t(language, 'auth.signIn') : t(language, 'auth.createAccount')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Logo */}
            <div className="text-center mb-5">
              <span className="text-2xl font-extrabold text-[#1A6BFF]">wakelni</span>
            </div>

            {/* FORGOT PASSWORD */}
            {view === 'login' && modalView === 'forgot' && (
              <>
                <h3 className="font-bold text-foreground mb-1">{copy.forgotTitle}</h3>
                <p className="text-xs text-muted-foreground mb-4">{copy.forgotSubtitle}</p>
                {forgotSuccess ? (
                  <div className="py-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{copy.emailSent}</p>
                    <button
                      type="button"
                      onClick={() => { setModalView('default'); setForgotSuccess(false); setForgotEmail(''); }}
                      className="text-sm text-[#1A6BFF] hover:underline"
                    >
                      ← {copy.backToSignIn}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>{t(language, 'auth.email')}</Label>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="input-glow"
                      />
                    </div>
                    {forgotError && (
                      <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                        {forgotError}
                      </div>
                    )}
                    <Button type="submit" disabled={isSending} className="w-full gradient-btn rounded-xl">
                      {isSending ? copy.sending : copy.sendLink}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setModalView('default'); setForgotError(null); setForgotEmail(''); }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                    >
                      ← {copy.backToSignIn}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* LOGIN */}
            {view === 'login' && modalView === 'default' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-email">{t(language, 'auth.email')}</Label>
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glow"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="modal-password">{t(language, 'auth.password')}</Label>
                    <button
                      type="button"
                      onClick={() => { setModalView('forgot'); setError(null); }}
                      className="text-xs text-[#1A6BFF] hover:underline"
                    >
                      {t(language, 'auth.forgotPassword')}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="modal-password"
                      type={showPassword ? 'text' : 'password'}
                      required
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
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading} className="w-full gradient-btn rounded-xl">
                  {isLoading ? copy.signingIn : t(language, 'auth.signIn')}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t(language, 'auth.dontHave')}{' '}
                  <button type="button" onClick={() => { openSignup(); reset(); }} className="text-[#1A6BFF] font-semibold hover:underline">
                    {t(language, 'auth.createAccount')}
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP */}
            {view === 'signup' && !signupSuccess && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>{t(language, 'auth.fullName')}</Label>
                  <Input
                    placeholder="John Doe"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="input-glow"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t(language, 'auth.email')}</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="input-glow"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t(language, 'auth.password')}</Label>
                  <div className="relative">
                    <Input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="input-glow pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {signupError && (
                  <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {signupError}
                  </div>
                )}
                <Button type="submit" disabled={isSigningUp} className="w-full gradient-btn rounded-xl">
                  {isSigningUp ? copy.creating : t(language, 'auth.createAccount')}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t(language, 'auth.alreadyHave')}{' '}
                  <button type="button" onClick={() => { openLogin(); reset(); }} className="text-[#1A6BFF] font-semibold hover:underline">
                    {t(language, 'auth.signIn')}
                  </button>
                </p>
              </form>
            )}

            {/* Signup success */}
            {view === 'signup' && signupSuccess && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✉️</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{copy.checkEmail}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {copy.confirmationSent} <strong>{signupEmail}</strong>. {copy.confirmationAction}
                </p>
                <Button variant="outline" onClick={() => { openLogin(); reset(); }} className="rounded-xl">
                  {copy.backToSignIn}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
