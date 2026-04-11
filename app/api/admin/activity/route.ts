import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin';
import { getOrSetRedisCache, isRedisConfigured } from '@/lib/redis-cache';

const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
  'X-Cache-Store': isRedisConfigured() ? 'redis' : 'none',
};

const ADMIN_ACTIVITY_CACHE_KEY = 'admin:activity:v1';

async function loadAdminActivity() {
  const admin = createAdminClient();

  const [foodRes, exerciseRes, weightRes, profilesRes] = await Promise.all([
    admin.from('food_logs').select('user_id, calories, meal_type, logged_at')
      .order('logged_at', { ascending: false }).limit(40),
    admin.from('exercise_logs').select('user_id, name, calories_burned, duration, logged_at')
      .order('logged_at', { ascending: false }).limit(40),
    admin.from('weight_history').select('user_id, weight_kg, recorded_at')
      .order('recorded_at', { ascending: false }).limit(20),
    admin.from('profiles').select('id, first_name, last_name, email'),
  ]);

  type ProfileRow = { id: string; first_name: string | null; last_name: string | null; email: string | null };
  const nameMap = new Map<string, string>();
  for (const profile of (profilesRes.data ?? []) as ProfileRow[]) {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || profile.id.slice(0, 8);
    nameMap.set(profile.id, name);
  }
  const getName = (id: string) => nameMap.get(id) ?? `${id.slice(0, 8)}...`;

  type FoodRow = { user_id: string; calories: number; meal_type: string; logged_at: string };
  type ExerciseRow = { user_id: string; name: string; calories_burned: number; duration: number; logged_at: string };
  type WeightRow = { user_id: string; weight_kg: number; recorded_at: string };

  const events = [
    ...((foodRes.data ?? []) as FoodRow[]).map((row) => ({
      type: 'food' as const,
      user: getName(row.user_id),
      label: `Logged ${Math.round(row.calories)} kcal (${row.meal_type})`,
      at: row.logged_at,
    })),
    ...((exerciseRes.data ?? []) as ExerciseRow[]).map((row) => ({
      type: 'exercise' as const,
      user: getName(row.user_id),
      label: `${row.name} - ${row.duration} min - ${row.calories_burned} kcal`,
      at: row.logged_at,
    })),
    ...((weightRes.data ?? []) as WeightRow[]).map((row) => ({
      type: 'weight' as const,
      user: getName(row.user_id),
      label: `Logged weight: ${row.weight_kg} kg`,
      at: row.recorded_at,
    })),
  ]
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
    .slice(0, 60);

  return { events };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const activity = await getOrSetRedisCache(ADMIN_ACTIVITY_CACHE_KEY, 15, loadAdminActivity);
    return Response.json(activity, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error('[admin/activity]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
