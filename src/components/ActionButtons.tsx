'use client'

import { motion } from 'framer-motion'
import type { ActionType, PetState } from '@/lib/types'

interface ActionButtonsProps {
  onAction: (action: ActionType) => void
  petState: PetState
  disabled: boolean
}

interface ButtonConfig {
  action: ActionType
  label: string
  icon: string
  color: string
  borderColor: string
  bgColor: string
  glowColor: string
  isDisabled: (state: PetState) => boolean
  disabledReason: string
}

const BUTTON_CONFIGS: ButtonConfig[] = [
  {
    action: 'feed',
    label: 'Feed',
    icon: '🍖',
    color: '#ffaa00',
    borderColor: 'rgba(255,170,0,0.5)',
    bgColor: 'rgba(255,170,0,0.1)',
    glowColor: 'rgba(255,170,0,0.4)',
    isDisabled: (s) => s.stats.hunger < 20,
    disabledReason: 'Not hungry',
  },
  {
    action: 'play',
    label: 'Play',
    icon: '🎮',
    color: '#00ffff',
    borderColor: 'rgba(0,255,255,0.5)',
    bgColor: 'rgba(0,255,255,0.1)',
    glowColor: 'rgba(0,255,255,0.4)',
    isDisabled: (s) => s.stats.energy < 15,
    disabledReason: 'Too tired',
  },
  {
    action: 'clean',
    label: 'Clean',
    icon: '🚿',
    color: '#4488ff',
    borderColor: 'rgba(68,136,255,0.5)',
    bgColor: 'rgba(68,136,255,0.1)',
    glowColor: 'rgba(68,136,255,0.4)',
    isDisabled: (s) => s.stats.cleanliness > 85,
    disabledReason: 'Already clean',
  },
  {
    action: 'sleep',
    label: 'Sleep',
    icon: '😴',
    color: '#aa66ff',
    borderColor: 'rgba(170,102,255,0.5)',
    bgColor: 'rgba(170,102,255,0.1)',
    glowColor: 'rgba(170,102,255,0.4)',
    isDisabled: () => false,
    disabledReason: '',
  },
  {
    action: 'medicine',
    label: 'Medicine',
    icon: '💊',
    color: '#00ff88',
    borderColor: 'rgba(0,255,136,0.5)',
    bgColor: 'rgba(0,255,136,0.1)',
    glowColor: 'rgba(0,255,136,0.4)',
    isDisabled: (s) => s.stats.health > 60,
    disabledReason: 'Healthy',
  },
]

export default function ActionButtons({ onAction, petState, disabled }: ActionButtonsProps) {
  const isDead = petState.gamePhase === 'dead'

  return (
    <div className="glass-panel p-4">
      <h3 className="text-xs font-mono text-[rgba(0,255,255,0.7)] uppercase tracking-widest mb-3">
        Actions
      </h3>

      {/* 3 + 2 grid layout */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {BUTTON_CONFIGS.slice(0, 3).map((config) => (
            <ActionButton
              key={config.action}
              config={config}
              petState={petState}
              disabled={disabled || isDead || config.isDisabled(petState)}
              isActive={petState.actionAnimation === config.action}
              onAction={onAction}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BUTTON_CONFIGS.slice(3).map((config) => (
            <ActionButton
              key={config.action}
              config={config}
              petState={petState}
              disabled={disabled || isDead || config.isDisabled(petState)}
              isActive={petState.actionAnimation === config.action}
              onAction={onAction}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ActionButtonProps {
  config: ButtonConfig
  petState: PetState
  disabled: boolean
  isActive: boolean
  onAction: (action: ActionType) => void
}

function ActionButton({ config, petState, disabled, isActive, onAction }: ActionButtonProps) {
  const isStatDisabled = config.isDisabled(petState)

  return (
    <motion.button
      onClick={() => !disabled && onAction(config.action)}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={
        isActive
          ? {
              boxShadow: [
                `0 0 8px ${config.glowColor}`,
                `0 0 20px ${config.glowColor}`,
                `0 0 8px ${config.glowColor}`,
              ],
            }
          : {}
      }
      transition={
        isActive
          ? { repeat: Infinity, duration: 0.6 }
          : { duration: 0.15 }
      }
      aria-label={`${config.label}${isStatDisabled ? ` (${config.disabledReason})` : ''}`}
      title={isStatDisabled ? config.disabledReason : config.label}
      className="relative flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-all duration-150 min-h-[56px]"
      style={{
        background: disabled ? 'rgba(255,255,255,0.03)' : config.bgColor,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : config.borderColor}`,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: isActive
          ? `0 0 12px ${config.glowColor}, inset 0 0 12px ${config.glowColor}20`
          : disabled
          ? 'none'
          : `0 0 6px ${config.glowColor}50`,
      }}
    >
      <span className="text-xl leading-none" role="img" aria-hidden="true">
        {config.icon}
      </span>
      <span
        className="text-[10px] font-mono font-semibold tracking-wide uppercase"
        style={{ color: disabled ? 'rgba(200,200,255,0.3)' : config.color }}
      >
        {config.label}
      </span>

      {/* Active pulse ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          style={{
            border: `2px solid ${config.color}`,
            boxShadow: `0 0 12px ${config.glowColor}`,
          }}
        />
      )}
    </motion.button>
  )
}
