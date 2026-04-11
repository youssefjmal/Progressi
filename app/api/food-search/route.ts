import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

interface UsdaNutrient {
  nutrientId: number;
  value?: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  foodNutrients?: UsdaNutrient[];
}

interface UsdaSearchResponse {
  foods?: UsdaFood[];
}

interface LocalFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: number;
  serving_unit: string;
  category: string | null;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.trim().length < 2) return NextResponse.json({ foods: [] });

  // Search local Supabase foods table
  const supabase = await createClient();
  const { data: localFoods } = await supabase
    .from('foods')
    .select('id, name, calories, protein, carbs, fat, serving_size, serving_unit, category')
    .ilike('name', `%${query}%`)
    .limit(10);

  const localResults = ((localFoods as LocalFood[]) || []).map((f) => ({
    id: `local_${f.id}`,
    name: f.name,
    calories: Math.round(f.calories),
    protein: Math.round((f.protein ?? 0) * 10) / 10,
    carbs: Math.round((f.carbs ?? 0) * 10) / 10,
    fat: Math.round((f.fat ?? 0) * 10) / 10,
    serving_size: f.serving_size,
    serving_unit: f.serving_unit,
    source: 'local',
  }));

  // Search USDA for additional results
  let usdaResults: typeof localResults = [];
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=10&dataType=SR%20Legacy,Foundation`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data: UsdaSearchResponse = await res.json();
      usdaResults = (data.foods || []).map((f: UsdaFood) => {
        const getNutrient = (id: number) =>
          f.foodNutrients?.find((n: UsdaNutrient) => n.nutrientId === id)?.value ?? 0;
        return {
          id: `usda_${f.fdcId}`,
          name: f.description
            .toLowerCase()
            .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          calories: Math.round(getNutrient(1008)),
          protein: Math.round(getNutrient(1003) * 10) / 10,
          carbs: Math.round(getNutrient(1005) * 10) / 10,
          fat: Math.round(getNutrient(1004) * 10) / 10,
          serving_size: 100,
          serving_unit: 'g',
          source: 'usda',
        };
      });
    }
  } catch {
    // USDA unavailable — local results still returned
  }

  // Local results first, then USDA (capped at 15 total)
  const foods = [...localResults, ...usdaResults].slice(0, 15);

  return NextResponse.json({ foods });
}
