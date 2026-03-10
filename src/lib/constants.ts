import type { Difficulty, PetStage } from './types'

// Decay rates per second (positive = stat decreases/increases)
export const DECAY_RATES: Record<Difficulty, { hunger: number; happiness: number; cleanliness: number; energy: number }> = {
  easy: { hunger: 0.25, happiness: 0.15, cleanliness: 0.1, energy: 0.08 },
  medium: { hunger: 0.5, happiness: 0.3, cleanliness: 0.2, energy: 0.15 },
  hard: { hunger: 0.9, happiness: 0.55, cleanliness: 0.35, energy: 0.28 },
}

// Health logic thresholds
export const HEALTH_DAMAGE_PER_SEC: Record<Difficulty, number> = {
  easy: 0.15,
  medium: 0.3,
  hard: 0.55,
}

export const HEALTH_REGEN_PER_SEC: Record<Difficulty, number> = {
  easy: 0.1,
  medium: 0.08,
  hard: 0.05,
}

// Action effects
export const ACTION_EFFECTS: Record<string, Partial<Record<string, number>>> = {
  feed: { hunger: -35, happiness: 5, energy: 2 },
  play: { happiness: 30, energy: -25, hunger: 8 },
  clean: { cleanliness: 55 },
  sleep: { energy: 40, hunger: 5 },
  medicine: { health: 35, energy: -5 },
}

// Stage thresholds (age in seconds)
export const STAGE_AGES: Record<PetStage, number> = {
  egg: 0,
  baby: 120,    // 2 min
  child: 300,   // 5 min
  teen: 900,    // 15 min
  adult: 1800,  // 30 min
}

// Score multipliers
export const SCORE_MULTIPLIERS = {
  happiness: (h: number) => 1 + h / 100,
  stageBonuses: { egg: 1, baby: 1.2, child: 1.5, teen: 2, adult: 3 } as Record<PetStage, number>,
}

// Game loop interval (ms)
export const GAME_TICK_MS = 250 // update 4 times per second for smoothness

// Critical stat thresholds
export const CRITICAL_THRESHOLD = 20
export const WARNING_THRESHOLD = 35
