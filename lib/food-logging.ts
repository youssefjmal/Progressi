type MinimalSupabase = {
  from: (table: string) => {
    select: (columns: string) => any;
    insert: (values: Record<string, unknown>) => any;
    upsert: (values: Record<string, unknown>, options?: Record<string, unknown>) => any;
  };
};

export interface FoodItemInput {
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  quantity: number;
  unit: string;
  meal_type?: string | null;
}

function normalizeMealType(mealType?: string | null) {
  const value = (mealType || '').trim().toLowerCase();
  if (value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snacks') {
    return value;
  }
  return 'snacks';
}

function normalizeFoodItem(item: FoodItemInput): FoodItemInput | null {
  const name = item.name?.trim();
  const calories = Number(item.calories);
  const quantity = Number(item.quantity);
  const unit = item.unit?.trim() || 'g';

  if (!name || !Number.isFinite(calories) || calories <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return {
    name,
    calories,
    protein: Number.isFinite(Number(item.protein)) ? Number(item.protein) : 0,
    carbs: Number.isFinite(Number(item.carbs)) ? Number(item.carbs) : 0,
    fat: Number.isFinite(Number(item.fat)) ? Number(item.fat) : 0,
    quantity,
    unit,
    meal_type: normalizeMealType(item.meal_type),
  };
}

export async function logFoodItems(
  supabase: MinimalSupabase,
  userId: string,
  items: FoodItemInput[],
) {
  let logged = 0;

  for (const rawItem of items) {
    const item = normalizeFoodItem(rawItem);
    if (!item) continue;

    // Upsert into foods using the lower(name) unique index.
    // This is race-safe: concurrent inserts for the same food name will
    // resolve to the same row instead of creating duplicates.
    const { data: upserted, error: upsertErr } = await supabase
      .from('foods')
      .upsert(
        {
          name: item.name,
          calories: item.calories,
          protein: item.protein ?? 0,
          carbs: item.carbs ?? 0,
          fat: item.fat ?? 0,
          serving_size: item.quantity,
          serving_unit: item.unit,
          category: 'Chat Logged',
        },
        { onConflict: 'name', ignoreDuplicates: false },
      )
      .select('id')
      .single();

    if (upsertErr) {
      console.error('Food upsert error:', upsertErr.code, upsertErr.message);
      continue;
    }

    const foodId = upserted?.id as string | undefined;
    if (!foodId) continue;

    const { error: logErr } = await supabase.from('food_logs').insert({
      user_id: userId,
      food_id: foodId,
      meal_type: item.meal_type || 'snacks',
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein ?? 0,
      carbs: item.carbs ?? 0,
      fat: item.fat ?? 0,
    });

    if (logErr) {
      console.error('Food log error:', logErr.code, logErr.message);
      continue;
    }

    logged += 1;
  }

  return { logged };
}
