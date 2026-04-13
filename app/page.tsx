'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentType, type FormEvent, useEffect, useState } from 'react';
import { Apple, ChevronRight, Droplets, Footprints, Mail, MessageCircle, Moon, Sparkles, Sun, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/components/providers/theme-provider';
import { TopNav } from '@/components/navigation/top-nav';
import { t, type Language } from '@/lib/i18n';
import { MascotRobot } from '@/components/mascots/mascot';

const landingCopy: Record<Language, {
  badge: string;
  heroTitle: string;
  heroBody: string;
  miniCards: Array<{ label: string; value: string; icon: ComponentType<{ size?: number; className?: string }> }>;
  coachMode: string;
  today: string;
  todayBody: string;
  macros: Array<{ label: string; value: string; color: string }>;
  dietTitle: string;
  dietBody: string;
  trackKicker: string;
  trackTitle: string;
  features: Array<{ icon: ComponentType<{ size?: number; className?: string }>; title: string; desc: string }>;
  recommendationsKicker: string;
  recommendationsTitle: string;
  tips: Array<{ title: string; body: string }>;
  responsiveKicker: string;
  responsiveTitle: string;
  responsiveBody: [string, string];
  snapshotTitle: string;
  snapshot: Array<{ label: string; value: string }>;
  quickContact: string;
  contactPlaceholder: string;
  contactButton: string;
  contactSubject: string;
  contactBody: string;
  copyright: string;
}> = {
  en: {
    badge: 'Built for food, training, water, and recovery tracking',
    heroTitle: 'Track what your body needs, not just what you type into an app.',
    heroBody: 'wakelni combines calorie intake, hydration, steps, workouts, health-focused chat, and daily recommendations into one responsive web app for phone and desktop.',
    miniCards: [
      { label: 'Daily calories', value: 'Smart target', icon: FlameSafe },
      { label: 'Hydration', value: 'Water goal', icon: Droplets },
      { label: 'Movement', value: 'Step guidance', icon: Footprints },
    ],
    coachMode: 'Coach mode',
    today: 'Today',
    todayBody: 'consumed from meals and snacks',
    macros: [
      { label: 'Protein', value: '142g', color: '#3B82F6' },
      { label: 'Water', value: '2.4L', color: '#06B6D4' },
      { label: 'Steps', value: '8.2k', color: '#10B981' },
    ],
    dietTitle: 'Diet recommendation',
    dietBody: "Balance today's intake with lean protein, fruit, and more water before dinner to keep energy stable and macros on target.",
    trackKicker: 'What You Track',
    trackTitle: 'A single health system, not disconnected pages',
    features: [
      { icon: Apple, title: 'Food logging that understands real meals', desc: 'Log meals from your food database or by describing what you ate in chat.' },
      { icon: Footprints, title: 'Steps and movement targets', desc: 'Track walking goals, adherence, and daily movement without switching tools.' },
      { icon: Droplets, title: 'Hydration tracking', desc: 'Keep daily water targets visible so the dashboard reflects what actually happened.' },
      { icon: MessageCircle, title: 'Focused health coach', desc: 'The assistant stays inside food, training, recovery, and health topics to protect token usage.' },
    ],
    recommendationsKicker: 'Home Recommendations',
    recommendationsTitle: 'Tips and food guidance you can actually use',
    tips: [
      { title: 'Breakfast idea', body: 'Pair protein with fruit and slower carbs so the morning meal keeps energy stable longer.' },
      { title: 'Hydration rule', body: 'Spread water intake through the day instead of trying to catch up late at night.' },
      { title: 'Training nutrition', body: 'After training, combine protein with a moderate carb source to support recovery.' },
    ],
    responsiveKicker: 'Responsive By Design',
    responsiveTitle: 'Made for phone and desktop',
    responsiveBody: [
      'Use it like a mobile health tracker during the day, then open the same account on desktop to review deeper trends and body metrics.',
      'The same daily system tracks meals, water, steps, workouts, and dashboard summaries.',
    ],
    snapshotTitle: 'Daily snapshot',
    snapshot: [
      { label: 'Meals', value: '4' },
      { label: 'Water', value: '2.4L' },
      { label: 'Steps', value: '8.2k' },
      { label: 'Burn', value: '420' },
    ],
    quickContact: 'Quick contact',
    contactPlaceholder: 'Your email',
    contactButton: 'Contact',
    contactSubject: 'wakelni contact request',
    contactBody: 'Hi, I would like to know more about wakelni.',
    copyright: 'All rights reserved.',
  },
  fr: {
    badge: "Conçu pour suivre l'alimentation, l'entraînement, l'eau et la récupération",
    heroTitle: 'Suivez les besoins de votre corps, pas seulement ce que vous tapez dans une application.',
    heroBody: "wakelni réunit les calories, l'hydratation, les pas, les entraînements, le chat santé et les recommandations quotidiennes dans une seule application web responsive pour mobile et desktop.",
    miniCards: [
      { label: 'Calories quotidiennes', value: 'Objectif intelligent', icon: FlameSafe },
      { label: 'Hydratation', value: "Objectif d'eau", icon: Droplets },
      { label: 'Mouvement', value: 'Repères de pas', icon: Footprints },
    ],
    coachMode: 'Mode coach',
    today: "Aujourd'hui",
    todayBody: 'consommées via les repas et collations',
    macros: [
      { label: 'Protéines', value: '142g', color: '#3B82F6' },
      { label: 'Eau', value: '2.4L', color: '#06B6D4' },
      { label: 'Pas', value: '8.2k', color: '#10B981' },
    ],
    dietTitle: 'Recommandation nutrition',
    dietBody: "Équilibrez l'apport d'aujourd'hui avec des protéines maigres, des fruits et plus d'eau avant le dîner pour garder une énergie stable et vos macros sur la bonne voie.",
    trackKicker: 'Ce Que Vous Suivez',
    trackTitle: 'Un seul système santé, pas des pages déconnectées',
    features: [
      { icon: Apple, title: 'Journal alimentaire qui comprend les vrais repas', desc: "Enregistrez vos repas depuis la base alimentaire ou en décrivant ce que vous avez mangé dans le chat." },
      { icon: Footprints, title: 'Objectifs de pas et de mouvement', desc: "Suivez vos objectifs de marche, votre régularité et votre mouvement quotidien sans changer d'outil." },
      { icon: Droplets, title: "Suivi de l'hydratation", desc: "Gardez vos objectifs d'eau visibles pour que le tableau de bord reflète ce qui s'est vraiment passé." },
      { icon: MessageCircle, title: 'Coach santé ciblé', desc: "L'assistant reste centré sur l'alimentation, l'entraînement, la récupération et la santé pour protéger l'usage des tokens." },
    ],
    recommendationsKicker: 'Recommandations Accueil',
    recommendationsTitle: 'Des conseils et repères alimentaires vraiment utiles',
    tips: [
      { title: 'Idée petit-déjeuner', body: "Associez protéines, fruits et glucides lents pour garder une énergie plus stable le matin." },
      { title: "Règle d'hydratation", body: "Répartissez l'eau sur la journée au lieu d'essayer de tout rattraper tard le soir." },
      { title: "Nutrition d'entraînement", body: "Après l'entraînement, combinez des protéines avec une source modérée de glucides pour soutenir la récupération." },
    ],
    responsiveKicker: 'Responsive Par Design',
    responsiveTitle: 'Pensé pour téléphone et desktop',
    responsiveBody: [
      "Utilisez-le comme un tracker santé mobile pendant la journée, puis ouvrez le même compte sur desktop pour analyser les tendances et métriques plus en profondeur.",
      'Le même système quotidien suit les repas, l’eau, les pas, les entraînements et les résumés du tableau de bord.',
    ],
    snapshotTitle: 'Aperçu quotidien',
    snapshot: [
      { label: 'Repas', value: '4' },
      { label: 'Eau', value: '2.4L' },
      { label: 'Pas', value: '8.2k' },
      { label: 'Brûlées', value: '420' },
    ],
    quickContact: 'Contact rapide',
    contactPlaceholder: 'Votre e-mail',
    contactButton: 'Contacter',
    contactSubject: 'Demande de contact wakelni',
    contactBody: 'Bonjour, je souhaite en savoir plus sur wakelni.',
    copyright: 'Tous droits réservés.',
  },
  ar: {
    badge: 'مصمم لتتبع الأكل والتمرين والماء والتعافي',
    heroTitle: 'تابع ما يحتاجه جسمك، وليس فقط ما تكتبه داخل التطبيق.',
    heroBody: 'يجمع wakelni بين السعرات والماء والخطوات والتمارين والدردشة الصحية والتوصيات اليومية في تطبيق ويب واحد يعمل بسلاسة على الهاتف والكمبيوتر.',
    miniCards: [
      { label: 'السعرات اليومية', value: 'هدف ذكي', icon: FlameSafe },
      { label: 'مياه', value: 'هدف الماء', icon: Droplets },
      { label: 'الحركة', value: 'إرشاد الخطوات', icon: Footprints },
    ],
    coachMode: 'وضع المدرب',
    today: 'اليوم',
    todayBody: 'تم استهلاكها من الوجبات والوجبات الخفيفة',
    macros: [
      { label: 'البروتين', value: '142g', color: '#3B82F6' },
      { label: 'الماء', value: '2.4L', color: '#06B6D4' },
      { label: 'الخطوات', value: '8.2k', color: '#10B981' },
    ],
    dietTitle: 'توصية غذائية',
    dietBody: 'وازن استهلاك اليوم ببروتين خفيف وفاكهة وماء أكثر قبل العشاء للحفاظ على طاقة مستقرة ومغذيات متوازنة.',
    trackKicker: 'ما الذي تتابعه',
    trackTitle: 'نظام صحي واحد، وليس صفحات منفصلة',
    features: [
      { icon: Apple, title: 'تسجيل الطعام الذي يفهم الوجبات الحقيقية', desc: 'سجل وجباتك من قاعدة البيانات أو فقط اكتب ما أكلته في الدردشة.' },
      { icon: Footprints, title: 'أهداف الخطوات والحركة', desc: 'تابع المشي والالتزام والحركة اليومية بدون التنقل بين أدوات مختلفة.' },
      { icon: Droplets, title: 'متابعة الترطيب', desc: 'اجعل هدف الماء اليومي واضحاً حتى يعكس اللوح ما حدث فعلاً.' },
      { icon: MessageCircle, title: 'مدرب صحي مركز', desc: 'يبقى المساعد داخل نطاق التغذية والتمرين والتعافي والصحة للحفاظ على الاستخدام بكفاءة.' },
    ],
    recommendationsKicker: 'توصيات الصفحة الرئيسية',
    recommendationsTitle: 'نصائح وإرشادات غذائية يمكن الاستفادة منها فعلاً',
    tips: [
      { title: 'فكرة للفطور', body: 'اجمع بين البروتين والفواكه والكربوهيدرات الأبطأ لتحافظ على طاقة أكثر استقراراً صباحاً.' },
      { title: 'قاعدة الترطيب', body: 'وزع شرب الماء خلال اليوم بدل محاولة تعويضه كله في الليل.' },
      { title: 'تغذية التمرين', body: 'بعد التمرين اجمع بين البروتين ومصدر كربوهيدرات معتدل لدعم التعافي.' },
    ],
    responsiveKicker: 'مصمم لكل الأجهزة',
    responsiveTitle: 'مناسب للهاتف والكمبيوتر',
    responsiveBody: [
      'استخدمه كمتعقب صحي على الهاتف خلال اليوم، ثم افتح الحساب نفسه على الكمبيوتر لمراجعة المؤشرات بشكل أعمق.',
      'النظام اليومي نفسه يتابع الوجبات والماء والخطوات والتمارين وملخصات اللوحة.',
    ],
    snapshotTitle: 'ملخص يومي',
    snapshot: [
      { label: 'الوجبات', value: '4' },
      { label: 'الماء', value: '2.4L' },
      { label: 'الخطوات', value: '8.2k' },
      { label: 'الحرق', value: '420' },
    ],
    quickContact: 'تواصل سريع',
    contactPlaceholder: 'بريدك الإلكتروني',
    contactButton: 'تواصل',
    contactSubject: 'طلب تواصل من wakelni',
    contactBody: 'مرحباً، أود معرفة المزيد عن wakelni.',
    copyright: 'جميع الحقوق محفوظة.',
  },
};

export default function LandingPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [contactEmail, setContactEmail] = useState('');
  const copy = landingCopy[language];

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

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = contactEmail.trim();
    if (!email) return;

    const subject = encodeURIComponent(copy.contactSubject);
    const body = encodeURIComponent(`${copy.contactBody}\n\n${copy.contactPlaceholder}: ${email}`);
    window.location.href = `mailto:jmelyoussef1@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(26,107,255,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_24%),linear-gradient(180deg,#f4f9ff_0%,#edf5ff_42%,#f7fbff_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(26,107,255,0.20),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1830_42%,#0b1020_100%)]">
      <TopNav />

      <section className="overflow-hidden px-6 pb-20 pt-24">
        <div className="mx-auto max-w-7xl rounded-[2.4rem] border border-white/65 bg-white/72 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8 dark:border-white/8 dark:bg-white/5">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <div>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="inline-flex items-center gap-2 rounded-full bg-[#1A6BFF]/10 px-4 py-1.5 text-sm font-medium text-[#1A6BFF]">
                <Sparkles size={14} />
                {copy.badge}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mt-6 max-w-3xl text-5xl font-extrabold leading-[1.02] text-slate-900 dark:text-white md:text-6xl">
                {copy.heroTitle}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {copy.heroBody}
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
                {copy.miniCards.map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(239,246,255,0.80))] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/8 dark:bg-white/5">
                    <item.icon size={18} className="text-[#1A6BFF]" />
                    <p className="mt-3 text-sm font-semibold text-[#0E4FCC]">{item.value}</p>
                    <p className="mt-1 text-sm text-[#6A8CC0]">{item.label}</p>
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
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF] dark:border-white/10 dark:bg-white/10">{copy.coachMode}</div>
                    <div className="absolute h-36 w-36 rounded-full border border-[#1A6BFF]/15" />
                    <div className="absolute h-52 w-52 rounded-full border border-sky-300/40 dark:border-sky-400/15" />
                    <div className="absolute h-20 w-20 rounded-full bg-white/65 blur-2xl dark:bg-[#1A6BFF]/20" />
                    <MascotRobot size={190} />
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[1.4rem] border border-white/60 bg-white/76 p-4 dark:border-white/8 dark:bg-white/4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">{copy.today}</p>
                          <p className="mt-2 text-3xl font-bold text-[#0E4FCC]">1,840 kcal</p>
                          <p className="text-sm text-[#6A8CC0]">{copy.todayBody}</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#1A6BFF] text-sm font-bold text-[#1A6BFF]">78%</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {copy.macros.map((item) => (
                        <div key={item.label} className="rounded-[1.1rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.90),rgba(239,246,255,0.74))] p-3 text-center dark:border-white/8 dark:bg-white/4">
                          <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                          <p className="mt-1 text-[11px] text-[#6A8CC0]">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[1.4rem] border border-[#1A6BFF]/15 bg-[linear-gradient(135deg,rgba(26,107,255,0.08),rgba(14,165,233,0.05))] p-4">
                      <p className="text-sm font-semibold text-[#0E4FCC]">{copy.dietTitle}</p>
                      <p className="mt-2 text-sm leading-6 text-[#5478AF]">{copy.dietBody}</p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{copy.trackKicker}</p>
            <h2 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-white">{copy.trackTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.features.map((feature) => (
              <div key={feature.title} className="rounded-[1.8rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,255,0.82))] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/8 dark:bg-white/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A6BFF]/10 text-[#1A6BFF]"><feature.icon size={20} /></div>
                <h3 className="mt-4 text-lg font-bold text-[#0E4FCC]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6A8CC0]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{copy.recommendationsKicker}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{copy.recommendationsTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {copy.tips.map((tip) => (
                <div key={tip.title} className="rounded-[1.4rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,255,0.76))] p-4 dark:border-white/8 dark:bg-white/4">
                  <p className="text-sm font-semibold text-[#0E4FCC]">{tip.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#6A8CC0]">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/65 bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{copy.responsiveKicker}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{copy.responsiveTitle}</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
              <p>{copy.responsiveBody[0]}</p>
              <p>{copy.responsiveBody[1]}</p>
            </div>
            <div className="mt-6 rounded-[1.4rem] border border-[#1A6BFF]/15 bg-[linear-gradient(135deg,rgba(26,107,255,0.10),rgba(14,165,233,0.06))] p-4">
              <p className="text-sm font-semibold text-[#0E4FCC]">{copy.snapshotTitle}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {copy.snapshot.map((item) => (
                  <div key={item.label} className="rounded-[1rem] bg-white/70 px-3 py-3 text-center dark:bg-white/6">
                    <p className="text-lg font-bold text-[#0E4FCC]">{item.value}</p>
                    <p className="text-[11px] text-[#6A8CC0]">{item.label}</p>
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
            <span className="text-2xl font-extrabold text-[#1A6BFF]">wakelni</span>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/sign-up" className="transition-colors hover:text-foreground">{t(language, 'landing.ctaStart')}</Link>
              <Link href="/auth/login" className="transition-colors hover:text-foreground">{t(language, 'landing.ctaSignin')}</Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button onClick={() => setLanguage('en')} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>EN</button>
                <button onClick={() => setLanguage('fr')} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${language === 'fr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>FR</button>
                <button onClick={() => setLanguage('ar')} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${language === 'ar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>AR</button>
              </div>
              <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Toggle dark mode">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {/* Contact row */}
          <div className="rounded-[1.6rem] border border-white/65 bg-[linear-gradient(135deg,rgba(26,107,255,0.06),rgba(14,165,233,0.04))] px-6 py-5 dark:border-white/8 dark:bg-white/4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">{t(language, 'landing.contactTitle')}</p>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <form onSubmit={handleContactSubmit} className="max-w-md flex-1">
                <label htmlFor="footer-contact-email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">
                  {copy.quickContact}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="footer-contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                    placeholder={copy.contactPlaceholder}
                    className="h-11 flex-1 rounded-xl border border-[#1A6BFF]/15 bg-white/85 px-4 text-sm text-[#0E4FCC] placeholder:text-[#6A8CC0] focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/25 dark:border-white/10 dark:bg-white/6 dark:text-white dark:placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-[#1A6BFF] px-5 text-sm font-semibold text-white transition hover:bg-[#1456d1]"
                  >
                    {copy.contactButton}
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
              <a href="mailto:jmelyoussef1@gmail.com" className="flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-[#1A6BFF] dark:text-slate-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A6BFF]/10">
                  <Mail size={14} className="text-[#1A6BFF]" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">{t(language, 'landing.contactEmail')}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">jmelyoussef1@gmail.com</p>
                </div>
              </a>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">{`© ${new Date().getFullYear()} wakelni. ${copy.copyright}`}</p>
        </div>
      </footer>
    </div>
  );
}

function FlameSafe(props: { size?: number; className?: string }) {
  return <Target {...props} />;
}
