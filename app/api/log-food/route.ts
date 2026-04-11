import { createClient } from '@/lib/supabase/server';
import { logFoodItems } from '@/lib/food-logging';

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  meal_type?: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { items }: { items: FoodItem[] } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No items provided' }, { status: 400 });
    }

    const { logged } = await logFoodItems(supabase, user.id, items);
    if (logged === 0) {
      return Response.json({ error: 'No items could be saved. Check your food data.' }, { status: 422 });
    }
    return Response.json({ logged });
  } catch (err) {
    console.error('log-food error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
