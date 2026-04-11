import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin';
import { getOrSetRedisCache, isRedisConfigured } from '@/lib/redis-cache';

const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
  'X-Cache-Store': isRedisConfigured() ? 'redis' : 'none',
};

const ADMIN_USERS_CACHE_KEY = 'admin:users:v1';

async function loadAdminUsers() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [profilesRes, usageRes, foodActivityRes, exerciseActivityRes] = await Promise.all([
    admin
      .from('profiles')
      .select('id, first_name, last_name, email, created_at, current_weight, goal_weight, calorie_target')
      .order('created_at', { ascending: false })
      .limit(200),
    admin
      .from('ai_usage')
      .select('user_id, date, feedback_calls, chat_calls')
      .gte('date', thirtyDaysAgo),
    admin
      .from('food_logs')
      .select('user_id, logged_at')
      .order('logged_at', { ascending: false })
      .limit(1000),
    admin
      .from('exercise_logs')
      .select('user_id, logged_at')
      .order('logged_at', { ascending: false })
      .limit(1000),
  ]);

  type UsageRow = { user_id: string; date: string; feedback_calls: number; chat_calls: number };
  const usageByUser = new Map<string, { total: number; today: number }>();
  for (const row of (usageRes.data ?? []) as UsageRow[]) {
    const current = usageByUser.get(row.user_id) ?? { total: 0, today: 0 };
    current.total += row.feedback_calls + row.chat_calls;
    if (row.date === today) current.today += row.feedback_calls + row.chat_calls;
    usageByUser.set(row.user_id, current);
  }

  type ActivityRow = { user_id: string; logged_at: string };
  const lastActiveByUser = new Map<string, string>();
  for (const row of [
    ...((foodActivityRes.data ?? []) as ActivityRow[]),
    ...((exerciseActivityRes.data ?? []) as ActivityRow[]),
  ].sort((left, right) => new Date(right.logged_at).getTime() - new Date(left.logged_at).getTime())) {
    if (!lastActiveByUser.has(row.user_id)) {
      lastActiveByUser.set(row.user_id, row.logged_at);
    }
  }

  type ProfileRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    created_at: string;
    current_weight: number | null;
    goal_weight: number | null;
    calorie_target: number | null;
  };

  const users = (profilesRes.data ?? []).map((profile: ProfileRow) => ({
    id: profile.id,
    name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || '-',
    email: profile.email ?? '-',
    joinedAt: profile.created_at,
    lastActive: lastActiveByUser.get(profile.id) ?? null,
    calorieTarget: profile.calorie_target,
    currentWeight: profile.current_weight,
    goalWeight: profile.goal_weight,
    aiUsageToday: usageByUser.get(profile.id)?.today ?? 0,
    aiUsageTotal: usageByUser.get(profile.id)?.total ?? 0,
  }));

  return { users };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await getOrSetRedisCache(ADMIN_USERS_CACHE_KEY, 30, loadAdminUsers);
    return Response.json(users, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error('[admin/users]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
