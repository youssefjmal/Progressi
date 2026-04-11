export type ActivityLevel = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extra_active';

export interface BodyInputs {
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  currentWeight?: number | null;
  goalWeight?: number | null;
  activityLevel?: string | null;
  weightLossRate?: number | null;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
  extra_active: 1.9,
};

const DEFICIT_PER_RATE: Record<number, number> = {
  0.25: 275,
  0.5: 550,
  1: 1100,
};

const ACTIVITY_BASE_STEPS: Record<string, number> = {
  sedentary: 5000,
  lightlyActive: 7500,
  moderatelyActive: 9000,
  veryActive: 11000,
  extra_active: 13000,
};

export function calcBMR(weight: number, height: number, age: number, gender: string) {
  if (gender === 'female') return 10 * weight + 6.25 * height - 5 * age - 161;
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

export function calcTDEE(bmr: number, activityLevel: string) {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55);
}

export function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3B82F6' };
  if (bmi < 25) return { label: 'Balanced', color: '#10B981' };
  if (bmi < 30) return { label: 'Overweight', color: '#F59E0B' };
  return { label: 'High', color: '#EF4444' };
}

export function calcHydrationTargetMl(weight: number, activityLevel: string) {
  const base = weight * 35;
  const activityBonus =
    activityLevel === 'veryActive' ? 750 : activityLevel === 'extra_active' ? 1000 : activityLevel === 'moderatelyActive' ? 500 : 250;
  return Math.round(base + activityBonus);
}

export function calcStepSuggestion(
  tdee: number,
  targetCalories: number,
  activityLevel: string,
  bmi: number,
  direction: 'lose' | 'maintain' | 'gain',
) {
  const base = ACTIVITY_BASE_STEPS[activityLevel] ?? 7500;
  const deficit = tdee - targetCalories;
  const extraStepsForDeficit = direction === 'lose' ? Math.round((deficit * 0.25) / 0.04) : 0;
  const reducedStepsForSurplus = direction === 'gain' ? 500 : 0;
  const bmiBump = bmi >= 30 ? 500 : bmi >= 25 ? 1000 : 0;

  const recommended = Math.round((base + extraStepsForDeficit + bmiBump - reducedStepsForSurplus) / 500) * 500;
  const minimum = Math.round(base / 500) * 500;
  const optimal = Math.round((recommended + (direction === 'gain' ? 1500 : 2000)) / 500) * 500;

  return {
    minimum: Math.min(Math.max(minimum, 3000), 15000),
    recommended: Math.min(Math.max(recommended, 5000), 20000),
    optimal: Math.min(Math.max(optimal, 7000), 22000),
    kcalPerDay: Math.round(recommended * 0.04),
  };
}

export function computeBodyMetrics(inputs: BodyInputs) {
  const {
    age,
    gender,
    height,
    currentWeight,
    goalWeight,
    activityLevel = 'moderatelyActive',
    weightLossRate,
  } = inputs;

  if (!age || !gender || !height || !currentWeight) return null;

  const safeActivityLevel = activityLevel || 'moderatelyActive';
  const safeWeightLossRate = weightLossRate ?? 0.5;

  const bmi = Number((currentWeight / Math.pow(height / 100, 2)).toFixed(1));
  const bmr = calcBMR(currentWeight, height, age, gender);
  const tdee = calcTDEE(bmr, safeActivityLevel);
  const direction: 'lose' | 'maintain' | 'gain' =
    goalWeight == null
      ? 'maintain'
      : goalWeight < currentWeight
      ? 'lose'
      : goalWeight > currentWeight
      ? 'gain'
      : 'maintain';
  const calorieAdjustment = DEFICIT_PER_RATE[safeWeightLossRate] ?? 550;
  const targetCalories =
    direction === 'lose'
      ? Math.max(1200, Math.round(tdee - calorieAdjustment))
      : direction === 'gain'
      ? Math.round(tdee + calorieAdjustment)
      : Math.round(tdee);
  const protein = Math.round((targetCalories * 0.3) / 4);
  const carbs = Math.round((targetCalories * 0.4) / 4);
  const fat = Math.round((targetCalories * 0.3) / 9);
  const weeksToGoal =
    goalWeight && goalWeight !== currentWeight
      ? Math.ceil(Math.abs(currentWeight - goalWeight) / safeWeightLossRate)
      : null;
  const hydrationTargetMl = calcHydrationTargetMl(currentWeight, safeActivityLevel);
  const steps = calcStepSuggestion(tdee, targetCalories, safeActivityLevel, bmi, direction);

  return {
    bmi,
    bmiCategory: getBmiCategory(bmi),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    protein,
    carbs,
    fat,
    hydrationTargetMl,
    steps,
    direction,
    weeksToGoal,
  };
}

export function getExerciseIntensity(duration: number, caloriesBurned: number) {
  const rate = duration > 0 ? caloriesBurned / duration : 0;
  if (rate >= 11) return { label: 'High', color: '#EF4444' };
  if (rate >= 7) return { label: 'Moderate', color: '#F59E0B' };
  return { label: 'Light', color: '#10B981' };
}
