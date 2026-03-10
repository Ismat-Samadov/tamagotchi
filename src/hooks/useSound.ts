'use client'

import { useRef, useCallback } from 'react'

type AudioContextRef = AudioContext | null

function createAudioContext(): AudioContextRef {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.3,
  fadeOut = true
): void {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(gainValue, startTime)
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  }

  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.01)
}

export function useSoundEffects(enabled: boolean) {
  const ctxRef = useRef<AudioContextRef>(null)

  const getCtx = useCallback((): AudioContext | null => {
    if (!enabled) return null
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
    return ctxRef.current
  }, [enabled])

  const playFeed = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Two rising notes C4 -> E4
    playNote(ctx, 261.63, now, 0.12, 'sine', 0.3)
    playNote(ctx, 329.63, now + 0.12, 0.15, 'sine', 0.3)
  }, [getCtx])

  const playPlay = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Three bouncy notes C5, E5, G5
    playNote(ctx, 523.25, now, 0.08, 'triangle', 0.25)
    playNote(ctx, 659.25, now + 0.1, 0.08, 'triangle', 0.25)
    playNote(ctx, 783.99, now + 0.2, 0.12, 'triangle', 0.28)
  }, [getCtx])

  const playClean = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Ascending sparkle arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((freq, i) => {
      playNote(ctx, freq, now + i * 0.06, 0.08, 'sine', 0.2)
    })
  }, [getCtx])

  const playSleep = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Descending gentle notes
    const notes = [392, 349.23, 329.63, 261.63]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.2)
      gain.gain.setValueAtTime(0.2, now + i * 0.2)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.3)
      osc.start(now + i * 0.2)
      osc.stop(now + i * 0.2 + 0.35)
    })
  }, [getCtx])

  const playMedicine = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Healing chord (major triad)
    const notes = [261.63, 329.63, 392.0]
    notes.forEach((freq) => {
      playNote(ctx, freq, now, 0.4, 'sine', 0.15)
      playNote(ctx, freq * 2, now + 0.05, 0.3, 'triangle', 0.1)
    })
  }, [getCtx])

  const playLevelUp = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Triumphant 4-note fanfare
    const notes = [
      { freq: 392.0, time: 0, dur: 0.12, type: 'square' as OscillatorType },
      { freq: 523.25, time: 0.14, dur: 0.12, type: 'square' as OscillatorType },
      { freq: 659.25, time: 0.28, dur: 0.12, type: 'sine' as OscillatorType },
      { freq: 783.99, time: 0.42, dur: 0.3, type: 'sine' as OscillatorType },
    ]
    notes.forEach(({ freq, time, dur, type }) => {
      playNote(ctx, freq, now + time, dur, type, 0.3)
    })
  }, [getCtx])

  const playDeath = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Descending sad notes
    const notes = [440, 392, 349.23, 311.13, 261.63, 220]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = i < 3 ? 'sawtooth' : 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.25)
      gain.gain.setValueAtTime(0.2, now + i * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.4)
      osc.start(now + i * 0.25)
      osc.stop(now + i * 0.25 + 0.45)
    })
  }, [getCtx])

  const playButtonClick = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    const now = ctx.currentTime
    // Short click
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025)
    osc.start(now)
    osc.stop(now + 0.03)
  }, [getCtx])

  return {
    playFeed,
    playPlay,
    playClean,
    playSleep,
    playMedicine,
    playLevelUp,
    playDeath,
    playButtonClick,
  }
}
