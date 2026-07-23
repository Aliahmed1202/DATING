import { Relationship, Memory, Event, Note, Notification, Level } from '../types'

export const relationship: Relationship = {
  id: 'rel-1',
  name: 'Ali & Roma',
  type: 'Dating',
  start_date: '2025-02-22',
  cover_photo: null,
  score: 96,
}

export const levels: Level[] = [
  { name: 'Our Beginning', min_points: 0, max_points: 99 },
  { name: 'Getting Closer', min_points: 100, max_points: 249 },
  { name: 'Strong Bond', min_points: 250, max_points: 499 },
  { name: 'Growing Together', min_points: 500, max_points: 999 },
  { name: 'Our World', min_points: 1000, max_points: Infinity },
]

export const demoMemories: Memory[] = [
  {
    id: 'mem-1',
    title: 'First Time We Talked',
    description: 'The beginning of everything',
    memory_type: 'good',
    memory_date: '2025-02-22',
    mood: 'happy',
    photo_url: null,
    created_by: 'ali-user-id',
    created_at: '2025-02-22T00:00:00Z',
    points: 10,
  },
  {
    id: 'mem-2',
    title: 'Our First Phone Call',
    description: 'We talked until 7:30 AM',
    memory_type: 'good',
    memory_date: '2025-04-06',
    mood: 'excited',
    photo_url: null,
    created_by: 'roma-user-id',
    created_at: '2025-04-06T00:00:00Z',
    points: 10,
  },
  {
    id: 'mem-3',
    title: 'Our First Cinema Date',
    description: '',
    memory_type: 'good',
    memory_date: '2026-02-04',
    mood: 'happy',
    photo_url: null,
    created_by: 'ali-user-id',
    created_at: '2026-02-04T00:00:00Z',
    points: 10,
  },
  {
    id: 'mem-4',
    title: 'Asked You Out',
    description: '',
    memory_type: 'good',
    memory_date: '2026-04-05',
    mood: 'nervous',
    photo_url: null,
    created_by: 'ali-user-id',
    created_at: '2026-04-05T00:00:00Z',
    points: 10,
  },
]

export const demoEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Roma Birthday',
    event_type: 'birthday',
    date: '2026-07-24',
    time: null,
    location: null,
    description: null,
    repeat_yearly: true,
    status: 'upcoming',
    created_by: 'ali-user-id',
    created_at: '2025-02-22T00:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Ali Birthday',
    event_type: 'birthday',
    date: '2027-01-19',
    time: null,
    location: null,
    description: null,
    repeat_yearly: true,
    status: 'upcoming',
    created_by: 'roma-user-id',
    created_at: '2025-02-22T00:00:00Z',
  },
  {
    id: 'evt-3',
    title: 'Our Anniversary',
    event_type: 'anniversary',
    date: '2027-02-22',
    time: null,
    location: null,
    description: null,
    repeat_yearly: true,
    status: 'upcoming',
    created_by: 'ali-user-id',
    created_at: '2025-02-22T00:00:00Z',
  },
  {
    id: 'evt-4',
    title: 'Cinema Date',
    event_type: 'date',
    date: '2026-08-10',
    time: '19:00',
    location: null,
    description: null,
    repeat_yearly: false,
    status: 'upcoming',
    created_by: 'ali-user-id',
    created_at: '2025-02-22T00:00:00Z',
  },
]

export const demoNotes: Note[] = [
  {
    id: 'note-1',
    sender_id: 'ali-user-id',
    receiver_id: 'roma-user-id',
    type: 'thank_you',
    message: 'Thank you for always making the smallest moments feel special.',
    read: false,
    created_at: '2025-04-06T00:00:00Z',
  },
]

export const demoNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'roma-user-id',
    title: 'New Memory',
    message: 'Ali added a new memory',
    read: false,
    created_at: '2025-04-06T00:00:00Z',
  },
]

// Local storage helpers
export function getMemories(): Memory[] {
  const stored = localStorage.getItem('memories')
  return stored ? JSON.parse(stored) : demoMemories
}

export function setMemories(memories: Memory[]) {
  localStorage.setItem('memories', JSON.stringify(memories))
}

export function getEvents(): Event[] {
  const stored = localStorage.getItem('events')
  return stored ? JSON.parse(stored) : demoEvents
}

export function setEvents(events: Event[]) {
  localStorage.setItem('events', JSON.stringify(events))
}

export function getNotes(): Note[] {
  const stored = localStorage.getItem('notes')
  return stored ? JSON.parse(stored) : demoNotes
}

export function setNotes(notes: Note[]) {
  localStorage.setItem('notes', JSON.stringify(notes))
}

export function getNotifications(): Notification[] {
  const stored = localStorage.getItem('notifications')
  return stored ? JSON.parse(stored) : demoNotifications
}

export function setNotifications(notifications: Notification[]) {
  localStorage.setItem('notifications', JSON.stringify(notifications))
}

export function getRelationshipScore(): number {
  const stored = localStorage.getItem('relationshipScore')
  return stored ? parseInt(stored) : relationship.score
}

export function setRelationshipScore(score: number) {
  localStorage.setItem('relationshipScore', score.toString())
}
