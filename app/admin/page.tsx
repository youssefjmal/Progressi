'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Apple, Dumbbell, Mail, RefreshCw, Scale, Sparkles, Users, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type ApiError = {
  error: string;
};

function hasApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'error' in value;
}

interface Stats {
  totalUsers: number;
  newThisWeek: number;
  activeToday: number;
  aiCallsToday: number;
  aiCallsTotal: number;
  feedbackCallsToday: number;
  chatCallsToday: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastActive: string | null;
  calorieTarget: number | null;
  currentWeight: number | null;
  goalWeight: number | null;
  aiUsageToday: number;
  aiUsageTotal: number;
}

interface ActivityEvent {
  type: 'food' | 'exercise' | 'weight';
  user: string;
  label: string;
  at: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function eventIcon(type: ActivityEvent['type']) {
  if (type === 'food') return <Apple size={13} className="text-emerald-500" />;
  if (type === 'exercise') return <Dumbbell size={13} className="text-blue-500" />;
  return <Scale size={13} className="text-violet-500" />;
}

function eventBg(type: ActivityEvent['type']) {
  if (type === 'food') return 'bg-emerald-500/10';
  if (type === 'exercise') return 'bg-blue-500/10';
  return 'bg-violet-500/10';
}

function StatCard({ label, value, sub, accent, icon }: { label: string; value: string | number; sub?: string; accent: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/84 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5"
    >
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-15 blur-2xl" style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value.toLocaleString()}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const safeFetch = useCallback(async <T,>(url: string): Promise<T | ApiError> => {
    try {
      const res = await fetch(url, { cache: 'default' });
      const text = await res.text();
      const payload = text ? JSON.parse(text) : null;

      if (res.status === 403) {
        return { error: 'FORBIDDEN' };
      }

      if (!res.ok) {
        const message = payload && typeof payload === 'object' && 'error' in payload
          ? String(payload.error)
          : `Request failed (${res.status})`;
        return { error: message };
      }

      if (!payload) {
        return { error: `Empty response from ${url}` };
      }

      return payload as T;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : `Unexpected error while loading ${url}`,
      };
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    const [statsRes, usersRes, activityRes] = await Promise.all([
      safeFetch<Stats>('/api/admin/stats'),
      safeFetch<{ users: AdminUser[] }>('/api/admin/users'),
      safeFetch<{ events: ActivityEvent[] }>('/api/admin/activity'),
    ]);

    const firstError = [statsRes, usersRes, activityRes].find(hasApiError)?.error;

    if (firstError) {
      if (firstError === 'FORBIDDEN') {
        router.replace('/dashboard');
        return;
      }

      setLoadError(firstError);
      setIsLoading(false);
      return;
    }

    if (hasApiError(statsRes) || hasApiError(usersRes) || hasApiError(activityRes)) {
      setLoadError('Unexpected admin response');
      setIsLoading(false);
      return;
    }

    setStats(statsRes);
    setUsers(usersRes.users ?? []);
    setActivity(activityRes.events ?? []);
    setLastRefresh(new Date());
    setIsLoading(false);
  }, [router, safeFetch]);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.replace('/auth/login');
          return;
        }

        if (isMounted) {
          setAuthChecked(true);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Unable to verify admin access');
          setIsLoading(false);
        }
      }
    };

    void check();

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      void loadAll();
    }
  }, [authChecked, loadAll]);

  const handleRefresh = () => {
    void loadAll();
  };

  const filteredUsers = users.filter((user) =>
    [user.name, user.email].some((value) => value.toLowerCase().includes(search.toLowerCase())),
  );

  if (!authChecked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6BFF] border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <div className="max-w-lg rounded-[1.8rem] border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/30">
          <p className="text-sm font-bold text-red-700 dark:text-red-400">Admin panel error</p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{loadError}</p>
          {loadError.includes('SERVICE_ROLE') && (
            <p className="mt-3 rounded-xl bg-red-100 px-4 py-2 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-300">
              Add <code className="font-mono font-bold">SUPABASE_SERVICE_ROLE_KEY</code> to your{' '}
              <code className="font-mono font-bold">.env.local</code> file.
              <br />
              Get it from: Supabase Dashboard - Project Settings - API - service_role
            </p>
          )}
          <button
            onClick={handleRefresh}
            className="mt-4 rounded-xl bg-[#1A6BFF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1456d1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_34%,#f8fbff_74%,#ffffff_100%)] px-4 py-6 pb-24 dark:bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0f172a_42%,#020617_100%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500/12 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-red-600 dark:text-red-400">Admin</span>
              <Sparkles size={14} className="text-[#1A6BFF]" />
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white">wakelni Admin</h1>
            {lastRefresh && (
              <p className="mt-0.5 text-xs text-slate-400">Last updated {relativeTime(lastRefresh.toISOString())}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href="mailto:jmelyoussef1@gmail.com" className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/8">
              <Mail size={13} className="text-[#1A6BFF]" /> jmelyoussef1
            </a>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-xl bg-[#1A6BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1456d1]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={stats.totalUsers} sub={`+${stats.newThisWeek} this week`} accent="#1A6BFF" icon={<Users size={18} />} />
            <StatCard label="Active today" value={stats.activeToday} sub="logged food or exercise" accent="#10B981" icon={<Activity size={18} />} />
            <StatCard label="AI calls today" value={stats.aiCallsToday} sub={`${stats.feedbackCallsToday} feedback - ${stats.chatCallsToday} chat`} accent="#F59E0B" icon={<Zap size={18} />} />
            <StatCard label="AI calls total" value={stats.aiCallsTotal} sub="all time across all users" accent="#8B5CF6" icon={<Sparkles size={18} />} />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <div className="rounded-[2rem] border border-white/70 bg-white/84 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Users</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{filteredUsers.length} accounts</p>
              </div>
              <input
                type="search"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-52 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A6BFF]/40"
              />
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/6">
                    {['User', 'Joined', 'Last active', 'Weight', 'AI today', 'AI total'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-50 transition-colors hover:bg-slate-50/60 dark:border-white/4 dark:hover:bg-white/4 ${index % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-white/2'}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(user.joinedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {user.lastActive ? relativeTime(user.lastActive) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {user.currentWeight ? (
                          <span>{user.currentWeight} to {user.goalWeight ?? '?'} kg</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-lg px-2 py-0.5 text-xs font-bold ${user.aiUsageToday > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'text-slate-300'}`}>
                          {user.aiUsageToday || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {user.aiUsageTotal || <span className="font-normal text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm text-slate-400">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/84 shadow-[0_30px_100px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-white/8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A6BFF]">Live activity</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Recent events</p>
            </div>
            <div className="max-h-[560px] space-y-2 overflow-y-auto p-4">
              {activity.map((event, index) => (
                <motion.div
                  key={`${event.at}-${index}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.015 }}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/70 px-3 py-2.5 dark:border-white/6 dark:bg-white/4"
                >
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${eventBg(event.type)}`}>
                    {eventIcon(event.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{event.user}</p>
                    <p className="truncate text-[11px] text-slate-500">{event.label}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">{relativeTime(event.at)}</span>
                </motion.div>
              ))}
              {activity.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
