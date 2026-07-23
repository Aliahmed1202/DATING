import { Relationship, Memory, Event, Note, Notification, Level } from '../types'

// Get relationship with calculated start date
export function getRelationship(): Relationship {
  const startDate = calculateRelationshipStartDate()
  return {
    id: 'rel-1',
    name: 'Ali & Roma',
    type: 'Dating',
    start_date: startDate,
    cover_photo: null,
    score: getRelationshipScore(),
  }
}

export const levels: Level[] = [
  { name: 'Our Beginning', min_points: 0, max_points: 99 },
  { name: 'Getting Closer', min_points: 100, max_points: 249 },
  { name: 'Strong Bond', min_points: 250, max_points: 499 },
  { name: 'Growing Together', min_points: 500, max_points: 999 },
  { name: 'Our World', min_points: 1000, max_points: Infinity },
]

// Calculate relationship start date from earliest memory or event
export function calculateRelationshipStartDate(): string {
  const memories = getMemories()
  const events = getEvents()
  
  let earliestDate: string | null = null
  
  // Find earliest memory date
  memories.forEach(memory => {
    if (!earliestDate || memory.created_at < earliestDate) {
      earliestDate = memory.created_at
    }
  })
  
  // Find earliest event date
  events.forEach(event => {
    if (!earliestDate || event.created_at < earliestDate) {
      earliestDate = event.created_at
    }
  })
  
  return earliestDate || new Date().toISOString()
}

// Calculate days together
export function calculateDaysTogether(): number {
  const startDate = calculateRelationshipStartDate()
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Calculate age from birth date
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Local storage helpers
export function getMemories(): Memory[] {
  const stored = localStorage.getItem('memories')
  return stored ? JSON.parse(stored) : []
}

export function setMemories(memories: Memory[]) {
  localStorage.setItem('memories', JSON.stringify(memories))
}

export function getEvents(): Event[] {
  const stored = localStorage.getItem('events')
  return stored ? JSON.parse(stored) : []
}

export function setEvents(events: Event[]) {
  localStorage.setItem('events', JSON.stringify(events))
}

export function getNotes(): Note[] {
  const stored = localStorage.getItem('notes')
  return stored ? JSON.parse(stored) : []
}

export function setNotes(notes: Note[]) {
  localStorage.setItem('notes', JSON.stringify(notes))
}

export function getNotifications(): Notification[] {
  const stored = localStorage.getItem('notifications')
  return stored ? JSON.parse(stored) : []
}

export function setNotifications(notifications: Notification[]) {
  localStorage.setItem('notifications', JSON.stringify(notifications))
}

// Calculate user score based on activities
export function calculateUserScore(userId: string): number {
  const memories = getMemories()
  const events = getEvents()
  const notes = getNotes()
  
  let score = 0
  
  // Points from memories (10 points each)
  const userMemories = memories.filter(m => m.created_by === userId)
  score += userMemories.length * 10
  
  // Points from events (5 points each)
  const userEvents = events.filter(e => e.created_by === userId)
  score += userEvents.length * 5
  
  // Points from notes sent (3 points each)
  const userNotes = notes.filter(n => n.sender_id === userId)
  score += userNotes.length * 3
  
  return score
}

// Calculate relationship score based on combined activities
export function calculateRelationshipScore(): number {
  const memories = getMemories()
  const events = getEvents()
  const notes = getNotes()
  
  let score = 0
  
  // Points from memories (10 points each)
  score += memories.length * 10
  
  // Points from events (5 points each)
  score += events.length * 5
  
  // Points from notes (3 points each)
  score += notes.length * 3
  
  return score
}

export function getRelationshipScore(): number {
  const stored = localStorage.getItem('relationshipScore')
  if (stored) {
    return parseInt(stored)
  }
  // Calculate from activities if not stored
  const calculated = calculateRelationshipScore()
  setRelationshipScore(calculated)
  return calculated
}

export function setRelationshipScore(score: number) {
  localStorage.setItem('relationshipScore', score.toString())
}
