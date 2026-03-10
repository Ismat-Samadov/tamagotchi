'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePet } from '@/hooks/usePet'
import type { ActionType } from '@/lib/types'
import PetCanvas from './PetCanvas'
import StatusBars from './StatusBars'
import ActionButtons from './ActionButtons'
import StartScreen from './StartScreen'
import EndScreen from './EndScreen'
import Header from './Header'

export default function GameScreen() {
  const {
    petState,
    highScore,
    soundEnabled,
    newHighScore,
    startGame,
    performAction,
    togglePause,
    toggleSound,
    resetGame,
  } = usePet()

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (petState.gamePhase === 'start' || petState.gamePhase === 'dead') return

      const keyMap: Record<string, ActionType> = {
        f: 'feed',
        F: 'feed',
        p: 'play',
        P: 'play',
        c: 'clean',
        C: 'clean',
        s: 'sleep',
        S: 'sleep',
        m: 'medicine',
        M: 'medicine',
      }

      if (e.code === 'Space') {
        e.preventDefault()
        togglePause()
        return
      }

      const action = keyMap[e.key]
      if (action && petState.gamePhase === 'playing') {
        performAction(action)
      }
    },
    [petState.gamePhase, togglePause, performAction]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Start screen
  if (petState.gamePhase === 'start') {
    return <StartScreen onStart={startGame} highScore={highScore} />
  }

  const isPaused = petState.gamePhase === 'paused'
  const isDead = petState.gamePhase === 'dead'

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden bg-[#0a0a1a]"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #12122a 0%, #0a0a1a 70%)',
      }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 30%, rgba(0,255,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,0,255,0.03) 0%, transparent 50%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-3 pb-1">
        <Header
          score={petState.score}
          ageSeconds={petState.ageSeconds}
          stage={petState.stage}
          highScore={highScore?.score ?? 0}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onTogglePause={togglePause}
          gamePhase={petState.gamePhase}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 p-3 pt-4 overflow-hidden">
        {/* Left column: Pet canvas */}
        <div className="flex flex-col items-center gap-3 md:w-[280px] shrink-0">
          <motion.div
            className="glass-panel p-4 w-full flex items-center justify-center"
            animate={
              isPaused
                ? { opacity: 0.6 }
                : { opacity: 1 }
            }
          >
            <PetCanvas
              stage={petState.stage}
              mood={petState.mood}
              petType={petState.petType}
              ageSeconds={petState.ageSeconds}
            />
          </motion.div>

          {/* Mood display */}
          <div
            className="glass-panel px-4 py-2 w-full flex items-center justify-between"
          >
            <span className="text-xs font-mono text-[rgba(200,200,255,0.5)] uppercase tracking-widest">
              Mood
            </span>
            <span className="font-mono text-sm capitalize" style={{ color: moodColor(petState.mood) }}>
              {moodEmoji(petState.mood)} {petState.mood}
            </span>
          </div>
        </div>

        {/* Right column: Stats + Actions */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex-1">
            <StatusBars stats={petState.stats} stage={petState.stage} />
          </div>
          <ActionButtons
            onAction={performAction}
            petState={petState}
            disabled={isPaused}
          />
        </div>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
            style={{ background: 'rgba(5,5,20,0.5)', backdropFilter: 'blur(2px)' }}
          >
            <motion.div
              animate={{
                opacity: [1, 0.4, 1],
                scale: [1, 1.04, 1],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="glass-panel px-10 py-6 text-center pointer-events-auto"
            >
              <p
                className="font-mono font-black text-4xl tracking-[0.2em] uppercase"
                style={{
                  color: '#ffaa00',
                  textShadow: '0 0 20px rgba(255,170,0,0.8)',
                }}
              >
                PAUSED
              </p>
              <p className="text-xs font-mono text-[rgba(200,200,255,0.5)] mt-2">
                Press Space or ⏸ to resume
              </p>
              <motion.button
                onClick={togglePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 rounded-lg font-mono font-semibold text-sm uppercase tracking-widest"
                style={{
                  background: 'rgba(255,170,0,0.15)',
                  border: '1px solid rgba(255,170,0,0.4)',
                  color: '#ffaa00',
                }}
              >
                ▶ Resume
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End screen */}
      <AnimatePresence>
        {isDead && (
          <EndScreen
            petState={petState}
            highScore={highScore}
            onRestart={resetGame}
            newHighScore={newHighScore}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function moodEmoji(mood: string): string {
  const map: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    sick: '🤒',
    sleeping: '😴',
    eating: '😋',
    playing: '😄',
    dead: '💀',
  }
  return map[mood] ?? '😐'
}

function moodColor(mood: string): string {
  const map: Record<string, string> = {
    happy: '#00ff88',
    neutral: '#e0e0ff',
    sad: '#4488ff',
    sick: '#ffaa00',
    sleeping: '#aa66ff',
    eating: '#ffaa00',
    playing: '#00ffff',
    dead: '#ff3366',
  }
  return map[mood] ?? '#e0e0ff'
}
