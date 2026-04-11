'use client';

import { motion } from 'framer-motion';

// ─── Mascot: Coach / Dashboard ────────────────────────────────────────────────
export function MascotFlex({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
      animate={{ y: [0, -7, 0] }}
      transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="fxBody" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="fxSkin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="fxGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
        <filter id="fxDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1D4ED8" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Glow halo */}
      <ellipse cx="70" cy="105" rx="46" ry="32" fill="url(#fxGlow)" />

      {/* TORSO */}
      <g filter="url(#fxDrop)">
        <path d="M50 68 Q52 62 70 58 Q88 62 90 68 L94 100 Q70 108 46 100 Z" fill="url(#fxBody)" />
        {/* Chest badge */}
        <circle cx="70" cy="80" r="9" fill="#1D4ED8" />
        <path d="M65 80 L68.5 83.5 L75 76" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* HEAD */}
        <circle cx="70" cy="40" r="22" fill="url(#fxSkin)" />
      </g>

      {/* Headband */}
      <path d="M48 33 Q70 22 92 33" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M48 33 Q70 27 92 33" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Eyes */}
      <motion.ellipse cx="61" cy="40" rx="4" ry="4" fill="#1A1A2E"
        animate={{ ry: [4, 0.4, 4] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.45, 0.5] }}
      />
      <motion.ellipse cx="79" cy="40" rx="4" ry="4" fill="#1A1A2E"
        animate={{ ry: [4, 0.4, 4] }}
        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.45, 0.5] }}
      />
      <circle cx="62.5" cy="38.5" r="1.4" fill="white" />
      <circle cx="80.5" cy="38.5" r="1.4" fill="white" />

      {/* Confident smile */}
      <path d="M60 52 Q70 60 80 52" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" fill="none" />

      {/* LEFT ARM raised */}
      <motion.path d="M50 74 Q34 60 24 44"
        stroke="url(#fxSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ rotate: [-6, 6, -6] }}
        style={{ originX: '50px', originY: '74px' }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      />
      <motion.circle cx="24" cy="44" r="8" fill="url(#fxSkin)"
        animate={{ x: [-3, 3, -3], y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      />
      {/* Left dumbbell */}
      <motion.g animate={{ x: [-3, 3, -3], y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.6 }}>
        <rect x="12" y="37" width="24" height="7" rx="3.5" fill="#374151" />
        <rect x="10" y="32" width="6" height="17" rx="3" fill="#F59E0B" />
        <rect x="30" y="32" width="6" height="17" rx="3" fill="#F59E0B" />
      </motion.g>

      {/* RIGHT ARM raised */}
      <motion.path d="M90 74 Q106 60 116 44"
        stroke="url(#fxSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ rotate: [6, -6, 6] }}
        style={{ originX: '90px', originY: '74px' }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      />
      <motion.circle cx="116" cy="44" r="8" fill="url(#fxSkin)"
        animate={{ x: [3, -3, 3], y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
      />
      {/* Right dumbbell */}
      <motion.g animate={{ x: [3, -3, 3], y: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.6 }}>
        <rect x="104" y="37" width="24" height="7" rx="3.5" fill="#374151" />
        <rect x="102" y="32" width="6" height="17" rx="3" fill="#F59E0B" />
        <rect x="122" y="32" width="6" height="17" rx="3" fill="#F59E0B" />
      </motion.g>

      {/* SHORTS */}
      <path d="M48 97 Q52 114 54 124 L70 124 L70 100 Z" fill="#1D4ED8" />
      <path d="M92 97 Q88 114 86 124 L70 124 L70 100 Z" fill="#1E40AF" />

      {/* LEGS */}
      <path d="M54 124 Q52 133 52 140" stroke="url(#fxSkin)" strokeWidth="12" strokeLinecap="round" />
      <path d="M86 124 Q88 133 88 140" stroke="url(#fxSkin)" strokeWidth="12" strokeLinecap="round" />

      {/* SHOES */}
      <path d="M44 140 Q46 147 60 147 Q66 147 66 143" fill="#1E293B" />
      <path d="M80 143 Q80 147 94 147 Q100 147 96 141" fill="#1E293B" />
    </motion.svg>
  );
}

// ─── Mascot: Chef / Food ──────────────────────────────────────────────────────
export function MascotChef({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
      animate={{ rotate: [-2.5, 2.5, -2.5] }}
      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="chSkin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="chGlow" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
        </radialGradient>
        <filter id="chDrop">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#F97316" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="70" cy="110" rx="44" ry="28" fill="url(#chGlow)" />

      {/* CHEF HAT */}
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        <ellipse cx="70" cy="28" rx="24" ry="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="46" y="20" width="48" height="8" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        <ellipse cx="70" cy="12" rx="18" ry="14" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
        {/* Hat stripe */}
        <path d="M54 19 Q70 14 86 19" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
      </motion.g>

      {/* HEAD */}
      <g filter="url(#chDrop)">
        <circle cx="70" cy="52" r="20" fill="url(#chSkin)" />
      </g>

      {/* Eyes */}
      <motion.ellipse cx="62" cy="50" rx="3.5" ry="3.5" fill="#1A1A2E"
        animate={{ ry: [3.5, 0.3, 3.5] }}
        transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.48, 0.52] }}
      />
      <motion.ellipse cx="78" cy="50" rx="3.5" ry="3.5" fill="#1A1A2E"
        animate={{ ry: [3.5, 0.3, 3.5] }}
        transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.48, 0.52] }}
      />
      <circle cx="63.4" cy="48.6" r="1.2" fill="white" />
      <circle cx="79.4" cy="48.6" r="1.2" fill="white" />

      {/* Rosy cheeks */}
      <circle cx="55" cy="56" r="5" fill="#F87171" opacity="0.35" />
      <circle cx="85" cy="56" r="5" fill="#F87171" opacity="0.35" />

      {/* Big smile */}
      <path d="M60 60 Q70 68 80 60" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* BODY */}
      <path d="M50 70 Q52 65 70 62 Q88 65 90 70 L93 104 Q70 112 47 104 Z" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      {/* Apron strings */}
      <path d="M60 70 L64 86 L76 86 L80 70" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Buttons */}
      <circle cx="70" cy="78" r="2.2" fill="#FB923C" opacity="0.7" />
      <circle cx="70" cy="88" r="2.2" fill="#FB923C" opacity="0.7" />
      <circle cx="70" cy="98" r="2.2" fill="#FB923C" opacity="0.7" />

      {/* LEFT ARM (holding bowl) */}
      <path d="M50 76 Q38 86 30 96" stroke="url(#chSkin)" strokeWidth="11" strokeLinecap="round" />
      {/* Bowl */}
      <path d="M22 90 Q22 106 36 106 Q50 106 50 90 Z" fill="#FB923C" opacity="0.9" />
      <path d="M20 90 L52 90" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Steam */}
      {[0, 1, 2].map((i) => (
        <motion.path key={i}
          d={`M${28 + i * 7} 88 Q${30 + i * 7} 82 ${28 + i * 7} 76`}
          stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"
          animate={{ y: [0, -4, 0], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.25 }}
        />
      ))}

      {/* RIGHT ARM (fork) */}
      <motion.path d="M90 76 Q102 82 108 92"
        stroke="url(#chSkin)" strokeWidth="11" strokeLinecap="round"
        animate={{ rotate: [-8, 8, -8] }}
        style={{ originX: '90px', originY: '76px' }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
      {/* Fork */}
      <motion.g animate={{ rotate: [-8, 8, -8] }} style={{ originX: '90px', originY: '76px' }}
        transition={{ repeat: Infinity, duration: 1.2 }}>
        <rect x="105" y="86" width="5" height="20" rx="2.5" fill="#9CA3AF" />
        <line x1="105" y1="88" x2="103" y2="80" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <line x1="107.5" y1="88" x2="107.5" y2="80" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <line x1="110" y1="88" x2="112" y2="80" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* LEGS */}
      <path d="M54 102 Q52 118 50 128" stroke="url(#chSkin)" strokeWidth="11" strokeLinecap="round" />
      <path d="M86 102 Q88 118 90 128" stroke="url(#chSkin)" strokeWidth="11" strokeLinecap="round" />
      <path d="M42 128 Q44 136 58 136 Q64 134 60 130" fill="#374151" />
      <path d="M84 130 Q82 135 96 136 Q102 135 96 128" fill="#374151" />
    </motion.svg>
  );
}

// ─── Mascot: Athletic Runner / Calories ───────────────────────────────────────
export function MascotRunner({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 148 164" fill="none"
      animate={{ x: [0, 3, 0, -3, 0] }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="rnBody" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id="rnSkin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="rnShorts" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <radialGradient id="rnGlow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <filter id="rnDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#0891B2" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Energy glow */}
      <ellipse cx="78" cy="100" rx="58" ry="50" fill="url(#rnGlow)" />

      {/* Speed lines */}
      {[0, 1, 2, 3].map((i) => (
        <motion.line key={i}
          x1={34 - i * 7} y1={78 + i * 14}
          x2={12 - i * 7} y2={78 + i * 14}
          stroke="#22D3EE" strokeWidth={2.8 - i * 0.4} strokeLinecap="round"
          opacity={0.75 - i * 0.15}
          animate={{ x: [0, -10, 0], opacity: [0.75 - i * 0.15, 0, 0.75 - i * 0.15] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.07 }}
        />
      ))}

      <g filter="url(#rnDrop)">
        {/* TORSO */}
        <path d="M66 58 Q60 72 57 94 L96 94 Q93 72 86 58 Q76 52 66 58 Z" fill="url(#rnBody)" />
        {/* Chest stripe */}
        <path d="M68 66 Q76 72 84 66" stroke="#67E8F9" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.65" />

        {/* HEAD */}
        <circle cx="76" cy="36" r="22" fill="url(#rnSkin)" />
      </g>

      {/* Visor / headband */}
      <path d="M55 28 Q76 17 97 28" stroke="#F97316" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M55 28 Q76 23 97 28" stroke="#FED7AA" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Determined eyes */}
      <path d="M64 36 L70 39" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" />
      <path d="M81 39 L87 36" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" />

      {/* Grit mouth */}
      <path d="M67 48 L85 48" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M70 46 L70 50" stroke="#1A1A2E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M76 46 L76 50" stroke="#1A1A2E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M82 46 L82 50" stroke="#1A1A2E" strokeWidth="2.2" strokeLinecap="round" />

      {/* Sweat drop */}
      <motion.path d="M94 24 Q97 18 100 24 Q100 29 97 29 Q94 29 94 24" fill="#93C5FD"
        animate={{ opacity: [0.9, 0, 0.9], y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />

      {/* LEFT ARM (back, swinging behind) */}
      <motion.path d="M66 64 Q48 75 40 87"
        stroke="url(#rnSkin)" strokeWidth="12" strokeLinecap="round"
        animate={{ d: ['M66 64 Q48 75 40 87', 'M66 64 Q46 70 36 80', 'M66 64 Q48 75 40 87'] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
      />
      <motion.circle cx="40" cy="87" r="7.5" fill="url(#rnSkin)"
        animate={{ cx: [40, 36, 40], cy: [87, 80, 87] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />

      {/* RIGHT ARM (forward, driving) */}
      <motion.path d="M84 64 Q102 70 110 60"
        stroke="url(#rnSkin)" strokeWidth="12" strokeLinecap="round"
        animate={{ d: ['M84 64 Q102 70 110 60', 'M84 64 Q104 78 114 72', 'M84 64 Q102 70 110 60'] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
      />
      <motion.circle cx="110" cy="60" r="7.5" fill="url(#rnSkin)"
        animate={{ cx: [110, 114, 110], cy: [60, 72, 60] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />

      {/* SHORTS */}
      <path d="M57 90 Q60 108 62 118 L78 118 L78 94 Z" fill="url(#rnShorts)" />
      <path d="M96 90 Q93 108 90 118 L78 118 L78 94 Z" fill="#EA580C" />
      <line x1="78" y1="94" x2="78" y2="118" stroke="rgba(255,237,213,0.3)" strokeWidth="1.5" />

      {/* LEFT LEG (stride, power push) */}
      <motion.path d="M62 116 Q54 132 48 150"
        stroke="url(#rnSkin)" strokeWidth="12" strokeLinecap="round"
        animate={{ d: ['M62 116 Q54 132 48 150', 'M62 116 Q66 130 72 144', 'M62 116 Q54 132 48 150'] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
      />
      {/* Left shoe */}
      <motion.path d="M42 150 Q40 158 56 158 Q64 158 64 153" fill="#1E293B"
        animate={{ x: [-4, 8, -4], y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />

      {/* RIGHT LEG (recovery, knee drive) */}
      <motion.path d="M90 116 Q98 132 102 150"
        stroke="url(#rnSkin)" strokeWidth="12" strokeLinecap="round"
        animate={{ d: ['M90 116 Q98 132 102 150', 'M90 116 Q84 130 78 144', 'M90 116 Q98 132 102 150'] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
      />
      {/* Right shoe */}
      <motion.path d="M96 150 Q94 158 110 158 Q118 158 112 152" fill="#1E293B"
        animate={{ x: [4, -8, 4], y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      />
    </motion.svg>
  );
}

// ─── Mascot: AI Robot / Chat ──────────────────────────────────────────────────
export function MascotRobot({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="rbHead" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="rbBody" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#3730A3" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <radialGradient id="rbGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
        <filter id="rbDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#4338CA" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Glow */}
      <ellipse cx="70" cy="80" rx="52" ry="48" fill="url(#rbGlow)" />

      {/* Antenna */}
      <line x1="70" y1="10" x2="70" y2="22" stroke="#818CF8" strokeWidth="3.5" strokeLinecap="round" />
      <motion.circle cx="70" cy="7" r="6" fill="#6366F1"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />
      <circle cx="70" cy="7" r="3" fill="#A5B4FC" />

      <g filter="url(#rbDrop)">
        {/* HEAD */}
        <rect x="32" y="22" width="76" height="52" rx="14" fill="url(#rbHead)" />
        {/* Screen visor */}
        <rect x="38" y="28" width="64" height="40" rx="10" fill="#0F0F1A" />

        {/* Left eye — glowing orb */}
        <motion.circle cx="56" cy="48" r="10" fill="#00D4AA"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0 }}
        />
        <circle cx="56" cy="48" r="5" fill="white" opacity="0.9" />
        <circle cx="58" cy="46" r="2.5" fill="#00D4AA" />

        {/* Right eye — glowing orb */}
        <motion.circle cx="84" cy="48" r="10" fill="#00D4AA"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
        />
        <circle cx="84" cy="48" r="5" fill="white" opacity="0.9" />
        <circle cx="86" cy="46" r="2.5" fill="#00D4AA" />

        {/* Mouth — data bar equalizer */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.rect key={i}
            x={44 + i * 10} y={60} width="6" rx="3" fill="#6366F1"
            animate={{ height: [4, 9, 3, 11, 4], y: [62, 57, 63, 55, 62] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.18 }}
          />
        ))}
      </g>

      {/* NECK */}
      <rect x="60" y="74" width="20" height="10" rx="5" fill="#3730A3" />

      {/* BODY */}
      <g filter="url(#rbDrop)">
        <rect x="30" y="84" width="80" height="44" rx="14" fill="url(#rbBody)" />
        {/* Chest panel */}
        <rect x="38" y="92" width="64" height="28" rx="9" fill="#4338CA" />
        {/* Chest indicators */}
        {[0, 1, 2].map((i) => (
          <motion.circle key={i}
            cx={50 + i * 14} cy="103" r="5.5"
            fill={i === 0 ? '#EF4444' : i === 1 ? '#FBBF24' : '#10B981'}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.45 }}
          />
        ))}
        {/* Chest bar */}
        <rect x="44" y="112" width="52" height="4" rx="2" fill="#312E81" />
        <motion.rect x="44" y="112" height="4" rx="2" fill="#818CF8"
          animate={{ width: [10, 52, 10] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        />
      </g>

      {/* ARMS */}
      <motion.rect x="12" y="86" width="18" height="12" rx="6" fill="#3730A3"
        animate={{ rotate: [-12, 12, -12] }}
        style={{ originX: '30px', originY: '92px' }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />
      <motion.rect x="110" y="86" width="18" height="12" rx="6" fill="#3730A3"
        animate={{ rotate: [12, -12, 12] }}
        style={{ originX: '110px', originY: '92px' }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />

      {/* LEGS */}
      <rect x="42" y="126" width="18" height="18" rx="9" fill="#312E81" />
      <rect x="80" y="126" width="18" height="18" rx="9" fill="#312E81" />
      {/* Feet */}
      <path d="M36 144 Q38 148 56 148 Q60 146 56 143" fill="#1E1B4B" />
      <path d="M84 143 Q82 147 100 148 Q104 146 102 143" fill="#1E1B4B" />

      {/* Speech bubble */}
      <motion.g
        animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, -4] }}
        transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.15, 0.85, 1] }}
      >
        <rect x="88" y="12" width="42" height="24" rx="10" fill="white" stroke="#E0E7FF" strokeWidth="1.5" />
        <circle cx="95" cy="24" r="3" fill="#6366F1" />
        <circle cx="106" cy="24" r="3" fill="#6366F1" />
        <circle cx="117" cy="24" r="3" fill="#6366F1" />
        <path d="M94 36 L90 42 L102 36" fill="white" stroke="#E0E7FF" strokeWidth="1.5" strokeLinejoin="round" />
      </motion.g>
    </motion.svg>
  );
}

// ─── Mascot: Power Lifter / Exercise ─────────────────────────────────────────
export function MascotLifter({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
    >
      <defs>
        <linearGradient id="ltBody" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="ltSkin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="ltGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <filter id="ltDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#5B21B6" floodOpacity="0.45" />
        </filter>
      </defs>

      <ellipse cx="70" cy="100" rx="50" ry="38" fill="url(#ltGlow)" />

      {/* BARBELL */}
      <motion.g
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
      >
        <rect x="8" y="44" width="124" height="9" rx="4.5" fill="#374151" />
        {/* Left weight stack */}
        <rect x="8" y="34" width="12" height="29" rx="5" fill="#DC2626" />
        <rect x="22" y="37" width="9" height="23" rx="4" fill="#EF4444" />
        {/* Right weight stack */}
        <rect x="120" y="34" width="12" height="29" rx="5" fill="#DC2626" />
        <rect x="109" y="37" width="9" height="23" rx="4" fill="#EF4444" />
        {/* Weight shine */}
        <rect x="9" y="38" width="3" height="4" rx="1.5" fill="white" opacity="0.35" />
        <rect x="121" y="38" width="3" height="4" rx="1.5" fill="white" opacity="0.35" />
      </motion.g>

      {/* TORSO — wide, powerful */}
      <g filter="url(#ltDrop)">
        <path d="M44 66 Q46 60 70 57 Q94 60 96 66 L98 100 Q70 110 42 100 Z" fill="url(#ltBody)" />
        {/* Chest lines for muscle */}
        <path d="M56 72 Q64 76 70 72" stroke="#A78BFA" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M70 72 Q76 76 84 72" stroke="#A78BFA" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* Abs */}
        <path d="M62 86 Q70 88 78 86" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* HEAD */}
        <circle cx="70" cy="42" r="20" fill="url(#ltSkin)" />
      </g>

      {/* Effort face */}
      <path d="M56 40 L63 44" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" />
      <path d="M77 44 L84 40" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" />
      {/* Gritted teeth smile */}
      <path d="M60 54 Q70 60 80 54" stroke="#1A1A2E" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M62 52 L62 57" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 52 L68 57" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      <path d="M74 52 L74 57" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />
      <path d="M80 52 L80 57" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" />

      {/* Sweat drop */}
      <motion.path d="M86 36 Q89 30 92 36 Q92 41 89 41 Q86 41 86 36" fill="#93C5FD"
        animate={{ y: [0, 8], opacity: [0.9, 0] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />

      {/* ARMS UP */}
      <motion.path d="M46 72 Q36 56 36 44"
        stroke="url(#ltSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ d: ['M46 72 Q36 56 36 44', 'M46 72 Q34 54 32 41', 'M46 72 Q36 56 36 44'] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />
      <motion.path d="M94 72 Q104 56 104 44"
        stroke="url(#ltSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ d: ['M94 72 Q104 56 104 44', 'M94 72 Q106 54 108 41', 'M94 72 Q104 56 104 44'] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />

      {/* SHORTS */}
      <path d="M44 97 Q47 114 49 124 L70 124 L70 100 Z" fill="#5B21B6" />
      <path d="M96 97 Q93 114 91 124 L70 124 L70 100 Z" fill="#4C1D95" />

      {/* LEGS wide stance */}
      <path d="M49 124 Q44 132 42 140" stroke="url(#ltSkin)" strokeWidth="12" strokeLinecap="round" transform="rotate(-8 49 124)" />
      <path d="M91 124 Q96 132 98 140" stroke="url(#ltSkin)" strokeWidth="12" strokeLinecap="round" transform="rotate(8 91 124)" />
      <path d="M34 140 Q36 147 50 147 Q56 145 52 141" fill="#1E293B" />
      <path d="M90 141 Q88 146 102 147 Q108 145 106 140" fill="#1E293B" />
    </motion.svg>
  );
}

// ─── Mascot: Trophy Star / Profile ────────────────────────────────────────────
export function MascotStar({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
      animate={{ rotate: [-4, 4, -4], y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="stCup" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="stFace" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <radialGradient id="stGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <filter id="stDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#B45309" floodOpacity="0.4" />
        </filter>
      </defs>

      <ellipse cx="70" cy="105" rx="50" ry="34" fill="url(#stGlow)" />

      {/* Trophy base */}
      <g filter="url(#stDrop)">
        <rect x="38" y="118" width="64" height="10" rx="5" fill="url(#stCup)" />
        <rect x="30" y="126" width="80" height="13" rx="6.5" fill="#D97706" />
        <rect x="62" y="108" width="16" height="12" rx="5" fill="url(#stCup)" />

        {/* Trophy body */}
        <path d="M24 28 Q24 88 70 90 Q116 88 116 28 Z" fill="url(#stCup)" />

        {/* Trophy handles */}
        <path d="M24 36 Q8 36 8 56 Q8 70 24 68" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M116 36 Q132 36 132 56 Q132 70 116 68" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Trophy face */}
        <circle cx="70" cy="56" r="22" fill="url(#stFace)" />
      </g>

      {/* Star eyes */}
      {[[60, 54], [80, 54]].map(([cx, cy], i) => (
        <motion.path key={i}
          d={`M${cx} ${cy - 5} L${cx + 1.8} ${cy - 1.5} L${cx + 5} ${cy - 1.5} L${cx + 2.4} ${cy + 1} L${cx + 3.6} ${cy + 5} L${cx} ${cy + 2.5} L${cx - 3.6} ${cy + 5} L${cx - 2.4} ${cy + 1} L${cx - 5} ${cy - 1.5} L${cx - 1.8} ${cy - 1.5} Z`}
          fill="#D97706"
          animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
          transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.35 }}
        />
      ))}

      {/* Big smile */}
      <path d="M56 66 Q70 78 84 66" stroke="#1A1A2E" strokeWidth="3.2" strokeLinecap="round" fill="none" />

      {/* Trophy number 1 */}
      <text x="70" y="36" textAnchor="middle" fontSize="16" fontWeight="900" fill="white" opacity="0.6">#1</text>

      {/* Sparkles */}
      {[[18, 14], [108, 18], [116, 66], [14, 70]].map(([x, y], i) => (
        <motion.path key={i}
          d={`M${x} ${y} L${x + 3} ${y + 8} L${x + 9} ${y + 8} L${x + 4} ${y + 13} L${x + 6} ${y + 21} L${x} ${y + 16} L${x - 6} ${y + 21} L${x - 4} ${y + 13} L${x - 9} ${y + 8} L${x - 3} ${y + 8} Z`}
          fill="#FCD34D"
          animate={{ scale: [0, 1.1, 0], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.6 }}
        />
      ))}
    </motion.svg>
  );
}

// ─── Mascot: Energy / Calories ────────────────────────────────────────────────
export function MascotEnergy({ size = 120 }: { size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 140 148" fill="none"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="enBody" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="enSkin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="100%" stopColor="#FDBA74" />
        </linearGradient>
        <linearGradient id="enFlame" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="enBolt" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <radialGradient id="enGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#FB923C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
        </radialGradient>
        <filter id="enDrop">
          <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#C2410C" floodOpacity="0.45" />
        </filter>
        <filter id="enGlowF">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ambient glow halo */}
      <ellipse cx="70" cy="102" rx="52" ry="36" fill="url(#enGlow)" />

      {/* FLAME HAIR — animated flicker */}
      <motion.g filter="url(#enGlowF)"
        animate={{ scaleY: [1, 1.1, 0.95, 1.08, 1] }}
        style={{ originX: '70px', originY: '32px' }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
      >
        {/* Outer flame */}
        <path d="M40 32 Q36 10 54 4 Q46 18 58 16 Q52 6 70 2 Q88 6 82 16 Q94 18 86 4 Q104 10 100 32 Q88 20 70 24 Q52 20 40 32Z" fill="url(#enFlame)" />
        {/* Inner flame highlight */}
        <path d="M54 28 Q52 16 62 12 Q58 20 66 18 Q64 12 70 10 Q76 12 74 18 Q82 20 78 12 Q88 16 86 28 Q78 20 70 22 Q62 20 54 28Z" fill="#FDE047" opacity="0.75" />
      </motion.g>

      {/* HEAD */}
      <g filter="url(#enDrop)">
        <circle cx="70" cy="52" r="24" fill="url(#enSkin)" />
      </g>

      {/* Determined face */}
      {/* Left brow — angled, fierce */}
      <path d="M54 44 Q60 41 65 44" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Right brow */}
      <path d="M75 44 Q80 41 86 44" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Eyes — bright, confident */}
      <circle cx="62" cy="51" r="5.5" fill="white" />
      <circle cx="78" cy="51" r="5.5" fill="white" />
      <circle cx="63" cy="51" r="3" fill="#EA580C" />
      <circle cx="79" cy="51" r="3" fill="#EA580C" />
      <circle cx="64" cy="50" r="1.2" fill="#1A1A2E" />
      <circle cx="80" cy="50" r="1.2" fill="#1A1A2E" />
      {/* Eye gleam */}
      <circle cx="65" cy="49" r="1.5" fill="white" opacity="0.9" />
      <circle cx="81" cy="49" r="1.5" fill="white" opacity="0.9" />
      {/* Wide grin */}
      <path d="M57 62 Q70 72 83 62" stroke="#92400E" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Teeth */}
      <path d="M60 62 Q70 70 80 62 L78 64 Q70 71 62 64 Z" fill="white" opacity="0.9" />

      {/* NECK */}
      <rect x="62" y="74" width="16" height="10" rx="6" fill="#FDBA74" />

      {/* BODY */}
      <g filter="url(#enDrop)">
        <path d="M36 84 Q38 78 70 76 Q102 78 104 84 L106 118 Q70 128 34 118 Z" fill="url(#enBody)" />

        {/* Chest glow panel */}
        <rect x="46" y="88" width="48" height="22" rx="8" fill="#C2410C" opacity="0.6" />

        {/* Lightning bolt badge */}
        <path d="M72 90 L62 103 L69 103 L67 114 L78 101 L71 101 Z" fill="url(#enBolt)" filter="url(#enGlowF)" />
      </g>

      {/* LEFT ARM — out and slightly raised */}
      <motion.path
        d="M38 88 Q24 84 16 76"
        stroke="url(#enSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ d: ['M38 88 Q24 84 16 76', 'M38 88 Q22 82 14 72', 'M38 88 Q24 84 16 76'] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      />
      {/* Fist left */}
      <motion.circle cx="14" cy="74" r="7" fill="url(#enSkin)"
        animate={{ cx: [14, 12, 14], cy: [74, 70, 74] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
      />

      {/* RIGHT ARM — forward punch */}
      <motion.path
        d="M102 88 Q116 80 124 68"
        stroke="url(#enSkin)" strokeWidth="13" strokeLinecap="round"
        animate={{ d: ['M102 88 Q116 80 124 68', 'M102 88 Q118 78 128 64', 'M102 88 Q116 80 124 68'] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.3 }}
      />
      {/* Fist right */}
      <motion.circle cx="126" cy="66" r="7" fill="url(#enSkin)"
        animate={{ cx: [126, 130, 126], cy: [66, 62, 66] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* SHORTS */}
      <path d="M36 114 Q38 128 40 138 L68 138 L68 116 Z" fill="#C2410C" />
      <path d="M104 114 Q102 128 100 138 L72 138 L72 116 Z" fill="#9A3412" />

      {/* LEGS */}
      <path d="M40 138 Q38 144 42 148 L58 148 Q62 146 58 140" fill="url(#enSkin)" />
      <path d="M100 138 Q102 144 98 148 L82 148 Q78 146 82 140" fill="url(#enSkin)" />
      {/* Shoes */}
      <path d="M36 147 Q38 148 58 148 Q62 146 58 144 L36 144 Z" fill="#1C1917" />
      <path d="M82 144 L104 144 L102 147 Q100 148 82 148 Q78 146 82 144 Z" fill="#1C1917" />

      {/* Floating energy sparks */}
      {[
        { cx: 22, cy: 48, delay: 0 },
        { cx: 118, cy: 44, delay: 0.5 },
        { cx: 14, cy: 100, delay: 1.0 },
        { cx: 126, cy: 96, delay: 1.5 },
      ].map((spark, i) => (
        <motion.circle key={i}
          cx={spark.cx} cy={spark.cy} r="4"
          fill="#FDE047"
          filter="url(#enGlowF)"
          animate={{ scale: [0, 1.4, 0], opacity: [0, 0.9, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: spark.delay }}
        />
      ))}
    </motion.svg>
  );
}
