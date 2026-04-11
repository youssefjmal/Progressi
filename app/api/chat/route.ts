import { createClient } from '@/lib/supabase/server';

// Words that are clearly outside our domain — used only to block obvious off-topic
const CLEARLY_OFF_TOPIC = [
  'politics', 'stock market', 'cryptocurrency', 'bitcoin', 'code', 'programming',
  'javascript', 'python', 'sql', 'homework', 'essay', 'religion', 'war',
  'lawyer', 'legal advice', 'medical diagnosis', 'prescription',
];

function isObviouslyOffTopic(content: string) {
  const lower = content.toLowerCase();
  return CLEARLY_OFF_TOPIC.some((term) => lower.includes(term));
}

const LOGGING_PROMPT = `
## LOGGING RULES

### FOOD LOGGING
If the user reports eating or drinking something — even casually ("I had", "ate", "drank", "for breakfast I had", "snacked on", etc.) — append ONE block at the very end of your reply:

<food_log>
[{"name":"Food Name","calories":350,"protein":28,"carbs":35,"fat":10,"quantity":150,"unit":"g","meal_type":"breakfast"}]
</food_log>

- Use your best estimate for realistic nutritional values if exact values aren't given.
- Set meal_type to one of: breakfast, lunch, dinner, snacks.
- Include ALL items mentioned in a single array.
- Only include this block when the user is reporting what they ate — not when they're asking a question.

### EXERCISE LOGGING
If the user reports doing any physical activity — including "punching bag", "boxing", "stretching", "walking the dog", "played basketball", "did some HIIT", "15 min of X", etc. — append ONE block at the very end of your reply:

<exercise_log>
[{"name":"Boxing / Punching Bag","category":"Cardio","duration":15,"calories_burned":120,"sets":null,"reps":null,"weight_used":null}]
</exercise_log>

- Categories: Cardio, Strength, Flexibility, Sports, Other.
- Estimate calories_burned realistically based on body weight ~75 kg and intensity.
- For strength include sets, reps, weight_used when mentioned; otherwise null.
- You may include BOTH blocks if the user reports both food and exercise.
- Always place these blocks after your conversational reply, never before.
`.trim();

const MAX_MESSAGES = 20;      // history cap sent to Groq
const DAILY_CHAT_LIMIT = 100; // max AI chat messages per user per day

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // ── Rate limit: max 100 chat messages per user per day ─────────────────
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('chat_calls')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    if ((usage?.chat_calls ?? 0) >= DAILY_CHAT_LIMIT) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const send = (chunk: object) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          send({ type: 'text-start', id: 'text-0' });
          send({ type: 'text-delta', id: 'text-0', delta: `You've reached your daily chat limit of ${DAILY_CHAT_LIMIT} messages. Come back tomorrow!` });
          send({ type: 'text-end', id: 'text-0' });
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      });
    }

    // Validate messages array
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return new Response('Bad Request', { status: 400 });
    }

    // Keep only the last MAX_MESSAGES turns and ensure each has valid role + string content
    const messages = (body.messages as unknown[])
      .filter(
        (m): m is { role: string; content: string } =>
          typeof m === 'object' &&
          m !== null &&
          typeof (m as Record<string, unknown>).role === 'string' &&
          typeof (m as Record<string, unknown>).content === 'string',
      )
      .slice(-MAX_MESSAGES);

    if (messages.length === 0) {
      return new Response('Bad Request', { status: 400 });
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // Only hard-block clearly off-topic messages
    const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    if (isObviouslyOffTopic(latestUserMessage)) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const send = (chunk: object) =>
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          send({ type: 'text-start', id: 'text-0' });
          send({ type: 'text-delta', id: 'text-0', delta: "I'm your fitness coach — I can help with food, workouts, hydration, recovery, and health goals. What would you like to work on?" });
          send({ type: 'text-end', id: 'text-0' });
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      });
    }

    const profileSummary = profile
      ? `- Weight: ${profile.current_weight ?? '?'} kg  |  Goal: ${profile.goal_weight ?? '?'} kg
- Age: ${profile.age ?? '?'}  |  Gender: ${profile.gender ?? '?'}  |  Height: ${profile.height ?? '?'} cm
- Activity level: ${profile.activity_level ?? 'not set'}
- Daily calorie target: ${profile.calorie_target ?? 'not set'} kcal
- Protein target: ${profile.protein_target ?? '?'} g  |  Carbs: ${profile.carbs_target ?? '?'} g  |  Fat: ${profile.fat_target ?? '?'} g`
      : 'Profile not yet filled in.';

    const systemPrompt = `You are Progressi, an expert AI fitness and nutrition coach. You are helpful, encouraging, and direct.

## YOUR SCOPE
You help with: food logging, meal planning, macros, calorie counting, exercise tracking, workout advice, hydration, sleep, recovery, body composition, supplements, and general fitness goals.
For anything completely unrelated (politics, coding, etc.), briefly redirect: "I'm your fitness coach — let's talk workouts or nutrition."

## USER PROFILE
${profileSummary}

## TONE
- Be conversational and friendly — not robotic.
- Understand casual language: "I crushed my chest day", "had some eggs", "did 20 min on the bag" all count as logs.
- If the user says what they DID (past tense activity or meal), always log it AND respond conversationally.
- Keep replies concise — 2-4 sentences max unless the user asks for a plan or detailed advice.
- Use the user's stats to personalise advice (e.g. remaining calories, goal pacing).

${LOGGING_PROMPT}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_tokens: 1500,
        temperature: 0.6,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      console.error('Groq API error:', err);
      return new Response('AI service error', { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body!.getReader();
        let buffer = '';
        let started = false;

        const send = (chunk: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content;
                if (!delta) continue;

                if (!started) {
                  send({ type: 'text-start', id: 'text-0' });
                  started = true;
                }

                send({ type: 'text-delta', id: 'text-0', delta });
              } catch {
                // skip malformed chunks
              }
            }
          }

          if (started) {
            send({ type: 'text-end', id: 'text-0' });
            // Increment usage counter after successful response (fire-and-forget)
            supabase.rpc('increment_ai_usage', { p_user_id: user.id, p_date: today, p_column: 'chat_calls' });
          }
        } catch (err) {
          console.error('Stream error:', err);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
