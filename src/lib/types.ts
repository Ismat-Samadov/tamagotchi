export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult'
export type PetMood = 'happy' | 'neutral' | 'sad' | 'sick' | 'sleeping' | 'eating' | 'playing' | 'dead'
export type PetType = 'angel' | 'normal' | 'mischief' | 'sickly'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type GamePhase = 'start' | 'playing' | 'paused' | 'dead'
export type ActionType = 'feed' | 'play' | 'clean' | 'sleep' | 'medicine'

export interface PetStats {
  hunger: number       // 0=full, 100=starving
  happiness: number    // 0=sad, 100=very happy
  health: number       // 0=dead, 100=perfect
  cleanliness: number  // 0=dirty, 100=clean
  energy: number       // 0=exhausted, 100=energetic
}

export interface PetState {
  stats: PetStats
  stage: PetStage
  mood: PetMood
  petType: PetType
  ageSeconds: number
  score: number
  difficulty: Difficulty
  gamePhase: GamePhase
  actionAnimation: ActionType | null  // currently playing action animation
  lastAction: ActionType | null
  happinessAvg: number  // running average for type determination
  healthAvg: number
}

export interface HighScore {
  score: number
  ageSeconds: number
  petType: PetType
  stage: PetStage
  difficulty: Difficulty
  date: string
}
