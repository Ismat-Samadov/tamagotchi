'use client'

import { motion } from 'framer-motion'
import type { PetState, HighScore } from '@/lib/types'

interface EndScreenProps {
  petState: PetState
  highScore: HighScore | null
  onRestart: () => void
  newHighScore: boolean
}

const PET_TYPE_LABELS: Record<string, string> = {
  angel: '😇 Angel',
  normal: '🙂 Normal',
  mischief: '😈 Mischief',
  sickly: '🤒 Sickly',
}

const STAGE_LABELS: Record<string, string> = {
  egg: '🥚 Egg',
  baby: '🐣 Baby',
  child: '🐥 Child',
  teen: '🌟 Teen',
  adult: '✨ Adult',
}

function formatAge(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m === 0) return `${s} second${s !== 1 ? 's' : ''}`
  return `${m} minute${m !== 1 ? 's' : ''} and ${s} second${s !== 1 ? 's' : ''}`
}

export default function EndScreen({ petState, highScore, onRestart, newHighScore }: EndScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
        className="glass-panel w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center"
        style={{ border: '1px solid rgba(255,51,102,0.3)' }}
      >
        {/* Sad emoji */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl"
          role="img"
          aria-label="Sad face"
        >
          😢
        </motion.div>

        <div>
          <h2
            className="font-mono font-bold text-xl mb-1"
            style={{ color: '#ff3366', textShadow: '0 0 10px rgba(255,51,102,0.6)' }}
          >
            Your pet has passed away
          </h2>
          <p className="text-sm text-[rgba(200,200,255,0.6)]">
            They will be remembered fondly...
          </p>
        </div>

        {/* New high score banner */}
        {newHighScore && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="w-full py-2 px-4 rounded-lg text-center font-mono font-bold text-sm"
            style={{
              background: 'rgba(255,170,0,0.15)',
              border: '1px solid rgba(255,170,0,0.5)',
              color: '#ffaa00',
              textShadow: '0 0 8px rgba(255,170,0,0.8)',
              boxShadow: '0 0 16px rgba(255,170,0,0.2)',
            }}
          >
            🏆 NEW HIGH SCORE!
          </motion.div>
        )}

        {/* Stats summary */}
        <div
          className="w-full rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Score */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)]">Score</span>
            <span
              className="font-mono font-bold text-lg tabular-nums"
              style={{ color: '#ffaa00', textShadow: '0 0 6px rgba(255,170,0,0.6)' }}
            >
              {petState.score.toLocaleString()}
            </span>
          </div>

          {/* Age */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)]">Survived</span>
            <span className="font-mono text-sm text-[#e0e0ff]">
              {formatAge(petState.ageSeconds)}
            </span>
          </div>

          {/* Stage */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)]">Reached</span>
            <span className="font-mono text-sm text-[#e0e0ff]">
              {STAGE_LABELS[petState.stage]}
            </span>
          </div>

          {/* Pet type */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)]">Type</span>
            <span
              className="font-mono text-sm px-2 py-0.5 rounded"
              style={{ background: 'rgba(0,255,255,0.1)', color: '#00ffff' }}
            >
              {PET_TYPE_LABELS[petState.petType]}
            </span>
          </div>

          {/* Difficulty */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)]">Difficulty</span>
            <span className="font-mono text-sm capitalize text-[#e0e0ff]">
              {petState.difficulty}
            </span>
          </div>
        </div>

        {/* Best score comparison */}
        {highScore && !newHighScore && (
          <p className="text-xs font-mono text-[rgba(200,200,255,0.4)]">
            Best: {highScore.score.toLocaleString()} pts
          </p>
        )}

        {/* Play again button */}
        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-3 rounded-xl font-mono font-bold text-base uppercase tracking-widest relative overflow-hidden"
          style={{
            background: 'rgba(0,255,255,0.12)',
            border: '1px solid rgba(0,255,255,0.4)',
            color: '#00ffff',
            textShadow: '0 0 8px rgba(0,255,255,0.8)',
          }}
          animate={{
            boxShadow: [
              '0 0 12px rgba(0,255,255,0.2)',
              '0 0 22px rgba(0,255,255,0.4)',
              '0 0 12px rgba(0,255,255,0.2)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
