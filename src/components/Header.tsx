'use client'

import { motion } from 'framer-motion'
import type { PetStage, GamePhase } from '@/lib/types'

interface HeaderProps {
  score: number
  ageSeconds: number
  stage: PetStage
  highScore: number
  soundEnabled: boolean
  onToggleSound: () => void
  onTogglePause: () => void
  gamePhase: GamePhase
}

const STAGE_ICONS: Record<PetStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🌟',
  adult: '✨',
}

const STAGE_LABELS: Record<PetStage, string> = {
  egg: 'Egg',
  baby: 'Baby',
  child: 'Child',
  teen: 'Teen',
  adult: 'Adult',
}

function formatAge(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export default function Header({
  score,
  ageSeconds,
  stage,
  highScore,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  gamePhase,
}: HeaderProps) {
  const isPaused = gamePhase === 'paused'

  return (
    <header className="glass-panel px-4 py-3 flex items-center justify-between gap-2 relative z-10">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg" role="img" aria-label="NeonPet">🐾</span>
        <span
          className="font-mono font-bold text-sm hidden sm:block"
          style={{
            color: '#00ffff',
            textShadow: '0 0 8px rgba(0,255,255,0.8)',
          }}
        >
          NeonPet
        </span>
      </div>

      {/* Center: Score + Age + Stage */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Stage badge */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono"
          style={{
            background: 'rgba(0,255,255,0.1)',
            border: '1px solid rgba(0,255,255,0.25)',
            color: '#00ffff',
          }}
        >
          <span role="img" aria-label={STAGE_LABELS[stage]}>{STAGE_ICONS[stage]}</span>
          <span className="hidden xs:inline">{STAGE_LABELS[stage]}</span>
        </div>

        {/* Score */}
        <div className="text-center">
          <div
            className="font-mono font-bold text-base sm:text-lg tabular-nums"
            style={{
              color: '#ffaa00',
              textShadow: '0 0 8px rgba(255,170,0,0.8)',
            }}
          >
            {score.toLocaleString()}
          </div>
          <div className="text-[9px] font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest">
            score
          </div>
        </div>

        {/* Age */}
        <div className="text-center hidden sm:block">
          <div className="font-mono text-sm text-[#e0e0ff] tabular-nums">
            {formatAge(ageSeconds)}
          </div>
          <div className="text-[9px] font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest">
            age
          </div>
        </div>
      </div>

      {/* Right: High score + controls */}
      <div className="flex items-center gap-2">
        {/* High score */}
        {highScore > 0 && (
          <div className="text-center hidden md:block">
            <div
              className="font-mono text-xs tabular-nums"
              style={{ color: '#ff00ff', textShadow: '0 0 6px rgba(255,0,255,0.6)' }}
            >
              {highScore.toLocaleString()}
            </div>
            <div className="text-[9px] font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest">
              best
            </div>
          </div>
        )}

        {/* Sound toggle */}
        <motion.button
          onClick={onToggleSound}
          whileTap={{ scale: 0.9 }}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all"
          style={{
            background: soundEnabled ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${soundEnabled ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: soundEnabled ? '#00ffff' : 'rgba(200,200,255,0.4)',
          }}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </motion.button>

        {/* Pause toggle */}
        <motion.button
          onClick={onTogglePause}
          whileTap={{ scale: 0.9 }}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all"
          style={{
            background: isPaused ? 'rgba(255,170,0,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isPaused ? 'rgba(255,170,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: isPaused ? '#ffaa00' : 'rgba(200,200,255,0.7)',
          }}
        >
          {isPaused ? '▶' : '⏸'}
        </motion.button>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute left-1/2 -translate-x-1/2 -bottom-5 text-[10px] font-mono uppercase tracking-widest"
          style={{ color: '#ffaa00' }}
        >
          PAUSED
        </motion.div>
      )}
    </header>
  )
}
