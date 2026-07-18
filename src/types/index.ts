export interface User {
  id: string
  email: string
  name: string
  nickname: string
  avatar: string | null
  birth_date: string | null
  score: number
}

export interface Relationship {
  id: string
  name: string
  type: string
  start_date: string
  cover_photo: string | null
  score: number
}

export interface Memory {
  id: string
  title: string
  description: string
  memory_type: 'good' | 'hard_moment'
  memory_date: string
  mood: string
  photo_url: string | null
  created_by: string
  created_at: string
  points: number
}

export interface MemoryReaction {
  id: string
  memory_id: string
  user_id: string
  reaction: 'love' | 'emotional' | 'funny' | 'together' | 'special'
  created_at: string
}

export interface Event {
  id: string
  title: string
  event_type: 'birthday' | 'anniversary' | 'date' | 'trip' | 'important_day' | 'custom'
  date: string
  time: string | null
  location: string | null
  description: string | null
  repeat_yearly: boolean
  status: 'upcoming' | 'completed' | 'cancelled'
  created_at: string
}

export interface Note {
  id: string
  sender_id: string
  receiver_id: string
  type: 'love' | 'thank_you' | 'appreciation' | 'sorry' | 'miss_you' | 'random'
  message: string
  read: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface Level {
  name: string
  min_points: number
  max_points: number
}
