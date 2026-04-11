'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, Footprints, Target } from 'lucide-react';

interface DailyGoalsPanelProps {
  title: string;
  subtitle: string;
  waterMl: number;
  waterTargetMl: number;
  stepCount: number;
  stepTarget: number;
  stepInput: string;
  onStepInputChange: (value: string) => void;
  onAddWater: (amount: number) => void;
  onResetWater: () => void;
  onAddSteps: () => void;
  isSaving?: boolean;
}

function ProgressBar({ value, target, color }: { value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min(value / target, 1) * 100 : 0;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/70 dark:bg-white/8">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function DailyGoalsPanel({
  title,
  subtitle,
  waterMl,
  waterTargetMl,
  stepCount,
  stepTarget,
  stepInput,
  onStepInputChange,
  onAddWater,
  onResetWater,
  onAddSteps,
  isSaving = false,
}: DailyGoalsPanelProps) {
  return (
    <div className="rounded-[2rem] border border-white/65 bg-white/82 p-5 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/8 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A6BFF]">{title}</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{subtitle}</h2>

      <div className="mt-5 space-y-5">
        <div className="rounded-[1.4rem] border border-cyan-500/15 bg-cyan-500/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets size={16} className="text-cyan-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Water</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {(waterMl / 1000).toFixed(1)} / {(waterTargetMl / 1000).toFixed(1)} L
            </span>
          </div>
          <ProgressBar value={waterMl} target={waterTargetMl} color="linear-gradient(90deg,#06B6D4,#38BDF8)" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[250, 500, 750].map((amount) => (
              <Button
                key={amount}
                onClick={() => onAddWater(amount)}
                disabled={isSaving}
                className="rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
              >
                +{amount} ml
              </Button>
            ))}
            <Button onClick={onResetWater} disabled={isSaving || waterMl === 0} variant="outline" className="rounded-full">
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-emerald-500/15 bg-emerald-500/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Steps</span>
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {stepCount.toLocaleString()} / {stepTarget.toLocaleString()}
            </span>
          </div>
          <ProgressBar value={stepCount} target={stepTarget} color="linear-gradient(90deg,#10B981,#22C55E)" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {stepCount >= stepTarget
              ? 'Goal achieved for today.'
              : `${(stepTarget - stepCount).toLocaleString()} steps left to hit the recommendation.`}
          </p>
          <div className="mt-3 flex gap-2">
            <Input
              type="number"
              min="0"
              value={stepInput}
              onChange={(event) => onStepInputChange(event.target.value)}
              placeholder="Add steps"
              className="input-glow rounded-xl"
            />
            <Button onClick={onAddSteps} disabled={isSaving} className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              Add
            </Button>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-amber-500/15 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Why this matters</span>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Water and movement are part of the same daily system as meals and workouts, so the dashboard can reflect actual adherence.
          </p>
        </div>
      </div>
    </div>
  );
}
