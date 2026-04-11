import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DAILY_FEEDBACK_LIMIT = 10;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    // Client passes its local date so we don't query on UTC
    const paramDate = req.nextUrl.searchParams.get('date');
    const today = paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)
      ? paramDate
      : new Date().toISOString().split('T')[0]; // fallback to UTC
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // ── Rate limit: max 10 AI feedback calls per user per day ──────────────
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('feedback_calls')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if ((usage?.feedback_calls ?? 0) >= DAILY_FEEDBACK_LIMIT) {
      return Response.json(
        { error: `Daily AI feedback limit reached (${DAILY_FEEDBACK_LIMIT}/day). Try again tomorrow.` },
        { status: 429 },
      );
    }

    const [profileRes, foodRes, exerciseRes, wellnessRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('food_logs').select('calories,protein,carbs,fat,meal_type,logged_at').eq('user_id', user.id).gte('logged_at', `${today}T00:00:00`),
      supabase.from('exercise_logs').select('name,category,calories_burned,duration,sets,reps,weight_used,total_volume,logged_at').eq('user_id', user.id).gte('logged_at', `${weekAgo}T00:00:00`),
      supabase.from('daily_wellness').select('water_ml,step_count,tracking_date').eq('user_id', user.id).eq('tracking_date', today).maybeSingle(),
    ]);

    type FoodLog = { calories: number; protein: number; carbs: number; fat: number; meal_type: string; logged_at: string };
    type ExerciseLog = { name: string; category: string; calories_burned: number; duration: number; logged_at: string };

    const profile = profileRes.data;
    const foodLogs = (foodRes.data || []) as FoodLog[];
    const exerciseLogs = (exerciseRes.data || []) as ExerciseLog[];
    const wellness = wellnessRes.data;

    const totalCalories = foodLogs.reduce((s, l) => s + (l.calories || 0), 0);
    const totalProtein = foodLogs.reduce((s, l) => s + (l.protein || 0), 0);
    const totalCarbs = foodLogs.reduce((s, l) => s + (l.carbs || 0), 0);
    const totalFat = foodLogs.reduce((s, l) => s + (l.fat || 0), 0);
    const todayExercise = exerciseLogs.filter((l) => l.logged_at?.startsWith(today));
    const weekExercise = exerciseLogs;

    const prompt = `You are Progressi, an expert AI fitness coach. Analyze this user's data and give them a SHORT daily feedback report.

USER PROFILE:
- Age: ${profile?.age ?? '?'}, Gender: ${profile?.gender ?? '?'}
- Current weight: ${profile?.current_weight ?? '?'} kg, Goal: ${profile?.goal_weight ?? '?'} kg
- Activity level: ${profile?.activity_level ?? 'unknown'}
- Daily calorie target: ${profile?.calorie_target ?? 2000} kcal
- Protein target: ${profile?.protein_target ?? 140} g | Carbs: ${profile?.carbs_target ?? 220} g | Fat: ${profile?.fat_target ?? 70} g

TODAY'S NUTRITION:
- Calories consumed: ${Math.round(totalCalories)} / ${profile?.calorie_target ?? 2000} kcal
- Protein: ${Math.round(totalProtein)}g | Carbs: ${Math.round(totalCarbs)}g | Fat: ${Math.round(totalFat)}g
- Food entries logged: ${foodLogs.length}
- Meals logged: ${[...new Set(foodLogs.map((l) => l.meal_type))].join(', ') || 'none'}

TODAY'S ACTIVITY:
- Workouts logged: ${todayExercise.length}
- Calories burned: ${todayExercise.reduce((s, l) => s + (l.calories_burned || 0), 0)} kcal
- Water: ${wellness ? (wellness.water_ml / 1000).toFixed(1) : '0'} L logged
- Steps: ${wellness?.step_count?.toLocaleString() ?? '0'}

THIS WEEK'S TRAINING (last 7 days):
- Total sessions: ${weekExercise.length}
- Exercises: ${[...new Set(weekExercise.map((l) => l.name))].slice(0, 6).join(', ') || 'none'}

Generate a structured daily feedback report in this EXACT JSON format (no markdown, raw JSON only):
{
  "score": <0-100 integer representing today's overall adherence>,
  "scoreLabel": "<Excellent|Good|On Track|Needs Work|Rest Day>",
  "scoreColor": "<#10B981 for 80+, #1A6BFF for 60-79, #F59E0B for 40-59, #EF4444 for below 40>",
  "headline": "<one punchy sentence about today, max 10 words>",
  "insights": [
    {"type": "calories", "status": "<on_track|over|under|empty>", "text": "<1 sentence about calorie status>"},
    {"type": "protein", "status": "<on_track|over|under|empty>", "text": "<1 sentence about protein>"},
    {"type": "training", "status": "<done|light|rest|none>", "text": "<1 sentence about training today>"},
    {"type": "hydration", "status": "<on_track|low|empty>", "text": "<1 sentence about water>"}
  ],
  "tip": "<one practical, personalized tip for the rest of today or tomorrow, max 20 words>",
  "encouragement": "<one short motivational line tailored to their goal, max 12 words>"
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.4,
        stream: false,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error('Groq API error:', err);
      return Response.json({ error: 'AI unavailable' }, { status: 502 });
    }

    const result = await groqResponse.json();
    const raw = result.choices?.[0]?.message?.content ?? '';

    // Parse JSON out of the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in AI response:', raw);
      return Response.json({ error: 'Invalid AI response' }, { status: 500 });
    }

    const feedback = JSON.parse(jsonMatch[0]);

    // Atomically increment usage counter (fire-and-forget, don't block response)
    supabase.rpc('increment_ai_usage', { p_user_id: user.id, p_date: today, p_column: 'feedback_calls' });

    // Cache for 5 minutes per browser — prevents hammering the Groq API on every render
    return Response.json(feedback, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (error) {
    console.error('AI feedback error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
