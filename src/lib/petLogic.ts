import type { PetMood, PetStage, PetStats, PetType, Difficulty, ActionType } from './types'
import { DECAY_RATES, HEALTH_DAMAGE_PER_SEC, HEALTH_REGEN_PER_SEC, ACTION_EFFECTS, STAGE_AGES, SCORE_MULTIPLIERS } from './constants'

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

export function computeMood(stats: PetStats, sleeping: boolean): PetMood {
  if (stats.health <= 0) return 'dead'
  if (sleeping) return 'sleeping'
  if (stats.health < 25 || (stats.hunger > 85 && stats.cleanliness < 15)) return 'sick'
  if (stats.hunger > 75 || stats.happiness < 20 || stats.health < 40) return 'sad'
  if (stats.happiness > 70 && stats.hunger < 40 && stats.health > 60) return 'happy'
  return 'neutral'
}

export function computeStage(ageSeconds: number): PetStage {
  if (ageSeconds >= STAGE_AGES.adult) return 'adult'
  if (ageSeconds >= STAGE_AGES.teen) return 'teen'
  if (ageSeconds >= STAGE_AGES.child) return 'child'
  if (ageSeconds >= STAGE_AGES.baby) return 'baby'
  return 'egg'
}

export function computePetType(happinessAvg: number, healthAvg: number): PetType {
  if (happinessAvg >= 70 && healthAvg >= 70) return 'angel'
  if (happinessAvg >= 55 && healthAvg >= 55) return 'normal'
  if (happinessAvg >= 40 && healthAvg < 45) return 'sickly'
  return 'mischief'
}

export function applyDecay(stats: PetStats, difficulty: Difficulty, tickSeconds: number): PetStats {
  const rates = DECAY_RATES[difficulty]
  return {
    hunger: clamp(stats.hunger + rates.hunger * tickSeconds),
    happiness: clamp(stats.happiness - rates.happiness * tickSeconds),
    health: stats.health,  // health handled separately
    cleanliness: clamp(stats.cleanliness - rates.cleanliness * tickSeconds),
    energy: clamp(stats.energy - rates.energy * tickSeconds),
  }
}

export function applyHealthLogic(stats: PetStats, difficulty: Difficulty, tickSeconds: number): PetStats {
  const damagePer = HEALTH_DAMAGE_PER_SEC[difficulty]
  const regenPer = HEALTH_REGEN_PER_SEC[difficulty]

  let healthDelta = 0

  // Multiple bad conditions stack damage
  if (stats.hunger > 80) healthDelta -= damagePer * tickSeconds * (stats.hunger > 90 ? 1.5 : 1)
  if (stats.happiness < 15) healthDelta -= damagePer * 0.5 * tickSeconds
  if (stats.cleanliness < 20) healthDelta -= damagePer * 0.5 * tickSeconds
  if (stats.energy < 10) healthDelta -= damagePer * 0.3 * tickSeconds

  // Health regen when all stats are good
  const allGood = stats.hunger < 50 && stats.happiness > 50 && stats.cleanliness > 50 && stats.energy > 30
  if (allGood && stats.health < 100) {
    healthDelta += regenPer * tickSeconds
  }

  return {
    ...stats,
    health: clamp(stats.health + healthDelta),
  }
}

export function applyAction(stats: PetStats, action: ActionType): PetStats {
  const effects = ACTION_EFFECTS[action]
  if (!effects) return stats

  const newStats = { ...stats }

  if (effects.hunger !== undefined) newStats.hunger = clamp(stats.hunger + effects.hunger)
  if (effects.happiness !== undefined) newStats.happiness = clamp(stats.happiness + effects.happiness)
  if (effects.health !== undefined) newStats.health = clamp(stats.health + effects.health)
  if (effects.cleanliness !== undefined) newStats.cleanliness = clamp(stats.cleanliness + effects.cleanliness)
  if (effects.energy !== undefined) newStats.energy = clamp(stats.energy + effects.energy)

  return newStats
}

export function computeScore(currentScore: number, stats: PetStats, stage: PetStage, tickSeconds: number): number {
  const happinessMultiplier = SCORE_MULTIPLIERS.happiness(stats.happiness)
  const stageBonus = SCORE_MULTIPLIERS.stageBonuses[stage]
  const healthBonus = stats.health > 80 ? 1.2 : 1
  const delta = happinessMultiplier * stageBonus * healthBonus * tickSeconds * 2
  return Math.round(currentScore + delta)
}

export function updateRunningAverage(current: number, newValue: number, weight = 0.02): number {
  return clamp(current * (1 - weight) + newValue * weight)
}
