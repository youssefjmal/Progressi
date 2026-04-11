import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin';
import { getOrSetRedisCache, isRedisConfigured } from '@/lib/redis-cache';

const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=30, stale-while-revalidate=120',
  'X-Cache-Store': isRedisConfigured() ? 'redis' : 'none',
};

const ADMIN_STATS_CACHE_KEY = 'admin:stats:v1';

async function loadAdminStats() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalUsersRes, aiTodayRes, aiTotalRes, activeFoodTodayRes, activeExerciseTodayRes, newThisWeekRes] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('ai_usage').select('feedback_calls, chat_calls').eq('date', today),
    admin.from('ai_usage').select('feedback_calls, chat_calls'),
    admin.from('food_logs').select('user_id').gte('logged_at', `${today}T00:00:00`),
    admin.from('exercise_logs').select('user_id').gte('logged_at', `${today}T00:00:00`),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
  ]);

  type UsageRow = { feedback_calls: number; chat_calls: number };
  const aiToday = (aiTodayRes.data ?? []) as UsageRow[];
  const aiTotal = (aiTotalRes.data ?? []) as UsageRow[];
  const activeSet = new Set([
    ...((activeFoodTodayRes.data ?? []).map((row: { user_id: string }) => row.user_id)),
    ...((activeExerciseTodayRes.data ?? []).map((row: { user_id: string }) => row.user_id)),
  ]);

  return {
    totalUsers: totalUsersRes.count ?? 0,
    newThisWeek: newThisWeekRes.count ?? 0,
    activeToday: activeSet.size,
    aiCallsToday: aiToday.reduce((sum, row) => sum + row.feedback_calls + row.chat_calls, 0),
    aiCallsTotal: aiTotal.reduce((sum, row) => sum + row.feedback_calls + row.chat_calls, 0),
    feedbackCallsToday: aiToday.reduce((sum, row) => sum + row.feedback_calls, 0),
    chatCallsToday: aiToday.reduce((sum, row) => sum + row.chat_calls, 0),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stats = await getOrSetRedisCache(ADMIN_STATS_CACHE_KEY, 30, loadAdminStats);
    return Response.json(stats, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error('[admin/stats]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
