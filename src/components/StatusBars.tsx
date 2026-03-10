'use client'

import { motion } from 'framer-motion'
import type { PetStats, PetStage } from '@/lib/types'

interface StatusBarsProps {
  stats: PetStats
  stage: PetStage
}

interface StatBarConfig {
  key: keyof PetStats
  label: string
  icon: string
  inverted?: boolean  // hunger: high value = bad
  color: (value: number, inverted: boolean) => string
  glowColor: (value: number, inverted: boolean) => string
}

const STAT_CONFIGS: StatBarConfig[] = [
  {
    key: 'hunger',
    label: 'Hunger',
    icon: '🍖',
    inverted: true,
    color: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return '#ff3366'
      if (danger > 50) return '#ffaa00'
      return '#00ff88'
    },
    glowColor: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return 'rgba(255,51,102,0.5)'
      if (danger > 50) return 'rgba(255,170,0,0.5)'
      return 'rgba(0,255,136,0.3)'
    },
  },
  {
    key: 'happiness',
    label: 'Happiness',
    icon: '❤️',
    color: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return '#ff3366'
      if (danger > 50) return '#ffaa00'
      return '#ff00ff'
    },
    glowColor: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return 'rgba(255,51,102,0.5)'
      if (danger > 50) return 'rgba(255,170,0,0.5)'
      return 'rgba(255,0,255,0.3)'
    },
  },
  {
    key: 'health',
    label: 'Health',
    icon: '💊',
    color: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return '#ff3366'
      if (danger > 50) return '#ffaa00'
      return '#00ff88'
    },
    glowColor: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return 'rgba(255,51,102,0.5)'
      if (danger > 50) return 'rgba(255,170,0,0.5)'
      return 'rgba(0,255,136,0.3)'
    },
  },
  {
    key: 'cleanliness',
    label: 'Cleanliness',
    icon: '🚿',
    color: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return '#ff3366'
      if (danger > 50) return '#ffaa00'
      return '#00ffff'
    },
    glowColor: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return 'rgba(255,51,102,0.5)'
      if (danger > 50) return 'rgba(255,170,0,0.5)'
      return 'rgba(0,255,255,0.3)'
    },
  },
  {
    key: 'energy',
    label: 'Energy',
    icon: '⚡',
    color: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return '#ff3366'
      if (danger > 50) return '#ffaa00'
      return '#ffaa00'
    },
    glowColor: (v, inv) => {
      const danger = inv ? v : 100 - v
      if (danger > 75) return 'rgba(255,51,102,0.5)'
      if (danger > 50) return 'rgba(255,170,0,0.5)'
      return 'rgba(255,170,0,0.3)'
    },
  },
]

function isCritical(value: number, inverted: boolean): boolean {
  return inverted ? value > 80 : value < 20
}

function isWarning(value: number, inverted: boolean): boolean {
  return inverted ? value > 65 : value < 35
}

export default function StatusBars({ stats, stage }: StatusBarsProps) {
  if (stage === 'egg') {
    return (
      <div className="glass-panel p-4 flex items-center justify-center h-full">
        <p className="text-[rgba(200,200,255,0.6)] text-sm font-mono text-center">
          🥚 Waiting to hatch...
          <br />
          <span className="text-xs opacity-60">Stats hidden for egg stage</span>
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="text-xs font-mono text-[rgba(0,255,255,0.7)] uppercase tracking-widest mb-3">
        Pet Stats
      </h3>

      {STAT_CONFIGS.map((config) => {
        const value = stats[config.key]
        const inverted = config.inverted ?? false
        const displayValue = inverted ? 100 - value : value  // for hunger, show "fullness"
        const fillPercent = displayValue
        const color = config.color(value, inverted)
        const glowColor = config.glowColor(value, inverted)
        const critical = isCritical(value, inverted)
        const warning = isWarning(value, inverted)

        return (
          <div key={config.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm" role="img" aria-label={config.label}>
                  {config.icon}
                </span>
                <span className="text-xs font-mono text-[#e0e0ff] opacity-80">
                  {config.label}
                </span>
                {critical && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-xs text-[#ff3366]"
                    aria-label="Critical warning"
                  >
                    ⚠
                  </motion.span>
                )}
                {!critical && warning && (
                  <span className="text-xs text-[#ffaa00]" aria-label="Warning">
                    !
                  </span>
                )}
              </div>
              <span
                className="text-xs font-mono tabular-nums"
                style={{ color }}
              >
                {Math.round(displayValue)}%
              </span>
            </div>

            {/* Bar track */}
            <div
              className="relative h-3 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${color}aa, ${color})`,
                  boxShadow: critical
                    ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor}`
                    : `0 0 4px ${glowColor}`,
                }}
              />

              {/* Shimmer */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
