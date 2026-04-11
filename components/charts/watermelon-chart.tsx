'use client';

import { motion } from 'framer-motion';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  className?: string;
}

export function WatermelonChart({ consumed, goal, className = '' }: CalorieRingProps) {
  const percentage = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const isOver = consumed > goal;
  const radius = 68;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - percentage / 100);
  const ringColor = isOver ? '#EF4444' : undefined;

  const tipAngle = ((-90 + percentage * 3.6) * Math.PI) / 180;
  const tipCx = 92 + radius * Math.cos(tipAngle);
  const tipCy = 92 + radius * Math.sin(tipAngle);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <svg width="184" height="184" viewBox="0 0 184 184" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="crGrad" gradientUnits="userSpaceOnUse" x1="184" y1="0" x2="0" y2="184">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="40%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <filter id="crGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer decorative dashed ring */}
          <circle cx="92" cy="92" r={radius + 11}
            fill="none"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          {/* Background track */}
          <circle cx="92" cy="92" r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth={strokeWidth}
          />

          {/* Glow halo when progress > 0 */}
          {percentage > 0 && (
            <circle cx="92" cy="92" r={radius}
              fill="none"
              stroke={ringColor ?? '#F97316'}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 92 92)"
              opacity="0.15"
            />
          )}

          {/* Main progress ring */}
          <motion.circle cx="92" cy="92" r={radius}
            fill="none"
            stroke={ringColor ?? 'url(#crGrad)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            transform="rotate(-90 92 92)"
            filter="url(#crGlow)"
          />

          {/* Tip dot */}
          {percentage > 3 && (
            <motion.circle
              r="8"
              fill={ringColor ?? '#F97316'}
              filter="url(#crGlow)"
              initial={{ cx: 92, cy: 24, opacity: 0 }}
              animate={{ cx: tipCx, cy: tipCy, opacity: 1 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            />
          )}
        </svg>

        {/* Center text overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className={`text-4xl font-black leading-none tracking-tight ${isOver ? 'text-red-500' : 'text-slate-950 dark:text-white'}`}>
            {Math.round(percentage)}%
          </span>
          <span className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {Math.round(consumed).toLocaleString()} kcal
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            of {goal.toLocaleString()}
          </span>
        </div>

        {/* Pulsing aura near goal */}
        {percentage >= 90 && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: isOver
                ? 'radial-gradient(circle, rgba(239,68,68,0.14) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.96, 1.04, 0.96] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  );
}
