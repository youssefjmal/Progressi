import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query || query.trim().length < 2) return NextResponse.json({ foods: [] });

  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=15&dataType=SR%20Legacy,Foundation`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ foods: [] });

  const data: UsdaSearchResponse = await res.json();

  const foods = (data.foods || []).map((f: UsdaFood) => {
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

  return NextResponse.json({ foods });
}
