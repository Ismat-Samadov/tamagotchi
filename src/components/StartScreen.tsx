'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Difficulty, HighScore } from '@/lib/types'
import PetCanvas from './PetCanvas'

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void
  highScore: HighScore | null
}

const DIFFICULTIES: {
  value: Difficulty
  label: string
  icon: string
  description: string
  color: string
  borderColor: string
}[] = [
  {
    value: 'easy',
    label: 'Easy',
    icon: '🌱',
    description: 'Relaxed pace, forgiving stats',
    color: '#00ff88',
    borderColor: 'rgba(0,255,136,0.4)',
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: '⚡',
    description: 'Balanced challenge',
    color: '#ffaa00',
    borderColor: 'rgba(255,170,0,0.4)',
  },
  {
    value: 'hard',
    label: 'Hard',
    icon: '💀',
    description: 'Stats decay fast, stay alert!',
    color: '#ff3366',
    borderColor: 'rgba(255,51,102,0.4)',
  },
]

function formatAge(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

function generateParticles(count: number): Particle[] {
  const colors = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00']
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 4,
  }))
}

export default function StartScreen({ onStart, highScore }: StartScreenProps) {
  const [selected, setSelected] = useState<Difficulty>('medium')
  const [particles] = useState<Particle[]>(() => generateParticles(20))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a]">
      {/* Animated background particles */}
      {mounted && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -80, -160],
            opacity: [0, 0.8, 0],
            scale: [1, 1.2, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(0,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,0,255,0.04) 0%, transparent 50%)',
        }}
      />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center gap-6"
      >
        {/* Title */}
        <div className="text-center">
          <motion.h1
            className="font-mono font-black text-5xl sm:text-6xl tracking-tight mb-2"
            animate={{
              textShadow: [
                '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px rgba(0,255,255,0.5)',
                '0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 60px rgba(0,255,255,0.7)',
                '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px rgba(0,255,255,0.5)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ color: '#00ffff' }}
          >
            NeonPet
          </motion.h1>
          <p className="text-[rgba(200,200,255,0.6)] font-mono text-sm tracking-wide">
            Raise your digital companion
          </p>
        </div>

        {/* Pet preview */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="glass-panel p-3 rounded-2xl"
          style={{ border: '1px solid rgba(0,255,255,0.2)' }}
        >
          <PetCanvas stage="baby" mood="happy" petType="normal" ageSeconds={0} />
        </motion.div>

        {/* Difficulty selection */}
        <div className="w-full">
          <p className="text-center text-xs font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest mb-3">
            Choose Difficulty
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((diff) => {
              const isSelected = selected === diff.value
              return (
                <motion.button
                  key={diff.value}
                  onClick={() => setSelected(diff.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  aria-pressed={isSelected}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 relative"
                  style={{
                    background: isSelected
                      ? `${diff.color}15`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? diff.borderColor : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isSelected ? `0 0 16px ${diff.color}30` : 'none',
                  }}
                >
                  <span className="text-2xl" role="img" aria-label={diff.label}>
                    {diff.icon}
                  </span>
                  <span
                    className="font-mono font-bold text-xs"
                    style={{ color: isSelected ? diff.color : 'rgba(200,200,255,0.7)' }}
                  >
                    {diff.label}
                  </span>
                  <span className="text-[10px] text-center text-[rgba(200,200,255,0.4)] leading-tight">
                    {diff.description}
                  </span>

                  {isSelected && (
                    <motion.div
                      layoutId="difficulty-ring"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ border: `2px solid ${diff.color}` }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Start button */}
        <motion.button
          onClick={() => onStart(selected)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-mono font-bold text-lg tracking-widest uppercase relative overflow-hidden"
          style={{
            background: 'rgba(0,255,255,0.12)',
            border: '1px solid rgba(0,255,255,0.5)',
            color: '#00ffff',
            textShadow: '0 0 10px rgba(0,255,255,0.8)',
            boxShadow: '0 0 20px rgba(0,255,255,0.2)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(0,255,255,0.2)',
              '0 0 30px rgba(0,255,255,0.4)',
              '0 0 20px rgba(0,255,255,0.2)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Start Game
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,255,255,0.08), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        </motion.button>

        {/* High score */}
        <AnimatePresence>
          {highScore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel px-5 py-3 text-center w-full"
              style={{ border: '1px solid rgba(255,0,255,0.2)' }}
            >
              <p className="text-[10px] font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest mb-1">
                Best Score
              </p>
              <p
                className="font-mono font-bold text-2xl tabular-nums"
                style={{ color: '#ff00ff', textShadow: '0 0 8px rgba(255,0,255,0.6)' }}
              >
                {highScore.score.toLocaleString()}
              </p>
              <p className="text-[10px] font-mono text-[rgba(200,200,255,0.4)] mt-1">
                {highScore.stage} · {formatAge(highScore.ageSeconds)} · {highScore.difficulty}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls hint */}
        <div className="text-center">
          <p className="text-[10px] font-mono text-[rgba(200,200,255,0.3)] tracking-wide">
            Space=Pause · F=Feed · P=Play · C=Clean · S=Sleep · M=Medicine
          </p>
        </div>
      </motion.div>
    </div>
  )
}
