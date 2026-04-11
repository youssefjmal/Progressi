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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [profilesRes, usageRes, lastActiveRes] = await Promise.all([
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
    ]);

    // Usage lookup
    type UsageRow = { user_id: string; date: string; feedback_calls: number; chat_calls: number };
    const usageByUser = new Map<string, { total: number; today: number }>();
    for (const row of (usageRes.data ?? []) as UsageRow[]) {
      const cur = usageByUser.get(row.user_id) ?? { total: 0, today: 0 };
      cur.total += row.feedback_calls + row.chat_calls;
      if (row.date === today) cur.today += row.feedback_calls + row.chat_calls;
      usageByUser.set(row.user_id, cur);
    }

    // Last active lookup
    type LogRow = { user_id: string; logged_at: string };
    const lastActiveByUser = new Map<string, string>();
    for (const row of (lastActiveRes.data ?? []) as LogRow[]) {
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

    const users = (profilesRes.data ?? []).map((p: ProfileRow) => ({
      id: p.id,
      name: [p.first_name, p.last_name].filter(Boolean).join(' ') || '—',
      email: p.email ?? '—',
      joinedAt: p.created_at,
      lastActive: lastActiveByUser.get(p.id) ?? null,
      calorieTarget: p.calorie_target,
      currentWeight: p.current_weight,
      goalWeight: p.goal_weight,
      aiUsageToday: usageByUser.get(p.id)?.today ?? 0,
      aiUsageTotal: usageByUser.get(p.id)?.total ?? 0,
    }));

    return Response.json({ users });
  } catch (err) {
    console.error('[admin/users]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
