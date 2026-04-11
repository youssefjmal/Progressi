import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // ── Auth: only youssefjmel42@gmail.com ─────────────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [totalUsersRes, aiTodayRes, aiTotalRes, activeTodayRes, newThisWeekRes] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('ai_usage').select('feedback_calls, chat_calls').eq('date', today),
      admin.from('ai_usage').select('feedback_calls, chat_calls'),
      admin.from('food_logs').select('user_id').gte('logged_at', `${today}T00:00:00`),
      admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
    ]);

    type UsageRow = { feedback_calls: number; chat_calls: number };
    const aiToday = (aiTodayRes.data ?? []) as UsageRow[];
    const aiTotal = (aiTotalRes.data ?? []) as UsageRow[];
    const activeSet = new Set((activeTodayRes.data ?? []).map((r: { user_id: string }) => r.user_id));

    return Response.json({
      totalUsers:          totalUsersRes.count ?? 0,
      newThisWeek:         newThisWeekRes.count ?? 0,
      activeToday:         activeSet.size,
      aiCallsToday:        aiToday.reduce((s, r) => s + r.feedback_calls + r.chat_calls, 0),
      aiCallsTotal:        aiTotal.reduce((s, r) => s + r.feedback_calls + r.chat_calls, 0),
      feedbackCallsToday:  aiToday.reduce((s, r) => s + r.feedback_calls, 0),
      chatCallsToday:      aiToday.reduce((s, r) => s + r.chat_calls, 0),
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
