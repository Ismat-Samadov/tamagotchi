'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { PetState, PetStats, Difficulty, ActionType, HighScore, PetStage } from '@/lib/types'
import {
  computeMood,
  computeStage,
  computePetType,
  applyDecay,
  applyHealthLogic,
  applyAction,
  computeScore,
  updateRunningAverage,
} from '@/lib/petLogic'
import { GAME_TICK_MS } from '@/lib/constants'
import { useLocalStorage } from './useLocalStorage'
import { useSoundEffects } from './useSound'

const INITIAL_STATS: PetStats = {
  hunger: 10,
  happiness: 80,
  health: 100,
  cleanliness: 90,
  energy: 90,
}

function createInitialState(difficulty: Difficulty): PetState {
  return {
    stats: { ...INITIAL_STATS },
    stage: 'egg',
    mood: 'happy',
    petType: 'normal',
    ageSeconds: 0,
    score: 0,
    difficulty,
    gamePhase: 'playing',
    actionAnimation: null,
    lastAction: null,
    happinessAvg: 80,
    healthAvg: 100,
  }
}

export function usePet() {
  const [petState, setPetState] = useState<PetState>(() => ({
    ...createInitialState('medium'),
    gamePhase: 'start',
  }))

  const [highScore, setHighScore] = useLocalStorage<HighScore | null>('neonpet-highscore', null)
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('neonpet-sound', true)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStageRef = useRef<PetStage>('egg')
  const newHighScoreRef = useRef(false)
  const sleepingRef = useRef(false)

  const sounds = useSoundEffects(soundEnabled)

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startGame = useCallback(
    (difficulty: Difficulty) => {
      stopLoop()
      const initial = createInitialState(difficulty)
      prevStageRef.current = 'egg'
      sleepingRef.current = false
      newHighScoreRef.current = false
      setPetState(initial)
    },
    [stopLoop]
  )

  const resetGame = useCallback(() => {
    stopLoop()
    sleepingRef.current = false
    setPetState((prev) => ({
      ...createInitialState(prev.difficulty),
      gamePhase: 'start',
    }))
  }, [stopLoop])

  const togglePause = useCallback(() => {
    setPetState((prev) => {
      if (prev.gamePhase === 'playing') return { ...prev, gamePhase: 'paused' }
      if (prev.gamePhase === 'paused') return { ...prev, gamePhase: 'playing' }
      return prev
    })
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabled)
  }, [soundEnabled, setSoundEnabled])

  const performAction = useCallback(
    (action: ActionType) => {
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current)

      // Play corresponding sound
      if (soundEnabled) {
        switch (action) {
          case 'feed': sounds.playFeed(); break
          case 'play': sounds.playPlay(); break
          case 'clean': sounds.playClean(); break
          case 'sleep':
            sounds.playSleep()
            sleepingRef.current = true
            break
          case 'medicine': sounds.playMedicine(); break
        }
      }

      setPetState((prev) => {
        if (prev.gamePhase !== 'playing') return prev
        const newStats = applyAction(prev.stats, action)
        return {
          ...prev,
          stats: newStats,
          actionAnimation: action,
          lastAction: action,
          mood: action === 'sleep' ? 'sleeping' : action === 'feed' ? 'eating' : action === 'play' ? 'playing' : computeMood(newStats, false),
        }
      })

      actionTimerRef.current = setTimeout(() => {
        if (action === 'sleep') sleepingRef.current = false
        setPetState((prev) => ({
          ...prev,
          actionAnimation: null,
          mood: computeMood(prev.stats, false),
        }))
      }, 1500)
    },
    [sounds, soundEnabled]
  )

  // Game loop
  useEffect(() => {
    if (petState.gamePhase !== 'playing') {
      stopLoop()
      return
    }

    stopLoop()

    intervalRef.current = setInterval(() => {
      const tickSeconds = GAME_TICK_MS / 1000

      setPetState((prev) => {
        if (prev.gamePhase !== 'playing') return prev

        // Apply decay
        let newStats = applyDecay(prev.stats, prev.difficulty, tickSeconds)
        newStats = applyHealthLogic(newStats, prev.difficulty, tickSeconds)

        // Update age
        const newAge = prev.ageSeconds + tickSeconds

        // Check stage transition
        const newStage = computeStage(newAge)
        if (newStage !== prevStageRef.current) {
          prevStageRef.current = newStage
          if (soundEnabled) sounds.playLevelUp()
        }

        // Update running averages
        const newHappinessAvg = updateRunningAverage(prev.happinessAvg, newStats.happiness)
        const newHealthAvg = updateRunningAverage(prev.healthAvg, newStats.health)

        // Compute pet type
        const newPetType = computePetType(newHappinessAvg, newHealthAvg)

        // Compute mood
        const newMood = prev.actionAnimation
          ? prev.mood
          : computeMood(newStats, sleepingRef.current)

        // Compute score
        const newScore = computeScore(prev.score, newStats, newStage, tickSeconds)

        // Check death
        if (newStats.health <= 0) {
          if (soundEnabled) sounds.playDeath()

          // Check high score
          const isNewHighScore = !highScore || newScore > highScore.score
          newHighScoreRef.current = isNewHighScore

          if (isNewHighScore) {
            const newHS: HighScore = {
              score: newScore,
              ageSeconds: newAge,
              petType: newPetType,
              stage: newStage,
              difficulty: prev.difficulty,
              date: new Date().toISOString(),
            }
            setHighScore(newHS)
          }

          return {
            ...prev,
            stats: { ...newStats, health: 0 },
            stage: newStage,
            mood: 'dead',
            petType: newPetType,
            ageSeconds: newAge,
            score: newScore,
            gamePhase: 'dead',
            actionAnimation: null,
            happinessAvg: newHappinessAvg,
            healthAvg: newHealthAvg,
          }
        }

        return {
          ...prev,
          stats: newStats,
          stage: newStage,
          mood: newMood,
          petType: newPetType,
          ageSeconds: newAge,
          score: newScore,
          happinessAvg: newHappinessAvg,
          healthAvg: newHealthAvg,
        }
      })
    }, GAME_TICK_MS)

    return stopLoop
  }, [petState.gamePhase, stopLoop, sounds, soundEnabled, highScore, setHighScore])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoop()
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current)
    }
  }, [stopLoop])

  return {
    petState,
    highScore,
    soundEnabled,
    newHighScore: newHighScoreRef.current,
    startGame,
    performAction,
    togglePause,
    toggleSound,
    resetGame,
  }
}
