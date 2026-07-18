import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysTogether(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getCurrentLevel(score: number, levels: { min_points: number; max_points: number; name: string }[]) {
  for (const level of levels) {
    if (score >= level.min_points && score <= level.max_points) {
      return level
    }
  }
  return levels[levels.length - 1]
}

export function getProgressToNextLevel(score: number, levels: { min_points: number; max_points: number; name: string }[]) {
  const currentLevelIndex = levels.findIndex(
    (level) => score >= level.min_points && score <= level.max_points
  )
  
  if (currentLevelIndex === -1 || currentLevelIndex === levels.length - 1) {
    return { progress: 100, pointsToNext: 0 }
  }
  
  const currentLevel = levels[currentLevelIndex]
  const nextLevel = levels[currentLevelIndex + 1]
  const pointsInCurrentLevel = score - currentLevel.min_points
  const totalPointsInLevel = currentLevel.max_points - currentLevel.min_points
  const progress = (pointsInCurrentLevel / totalPointsInLevel) * 100
  const pointsToNext = nextLevel.min_points - score
  
  return { progress, pointsToNext }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
