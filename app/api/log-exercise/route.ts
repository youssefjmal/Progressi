import { createClient } from '@/lib/supabase/server';

interface ExerciseItem {
  name: string;
  category: string;
  duration: number;
  calories_burned: number;
  sets?: number | null;
  reps?: number | null;
  weight_used?: number | null;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { exercises }: { exercises: ExerciseItem[] } = await req.json();
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return Response.json({ error: 'No exercises provided' }, { status: 400 });
    }

    const inserts = exercises.map((ex) => ({
      user_id: user.id,
      name: ex.name,
      category: ex.category || 'Cardio',
      duration: ex.duration || 30,
      calories_burned: ex.calories_burned || 0,
      sets: ex.sets ?? null,
      reps: ex.reps ?? null,
      weight_used: ex.weight_used ?? null,
    }));

    const { error } = await supabase.from('exercise_logs').insert(inserts);
    if (error) {
      console.error('Exercise log error:', error.code, error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ logged: inserts.length });
  } catch (err) {
    console.error('log-exercise error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
