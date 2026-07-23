import type { User } from '../types'

const USERS: Record<string, User> = {
  ali: {
    id: 'ali-user-id',
    email: 'aliahmesbiso@gmail.com',
    name: 'Ali',
    nickname: 'Ali',
    avatar: null,
    birth_date: '2006-01-19',
    score: 0,
  },
  roma: {
    id: 'roma-user-id',
    email: 'romysaa.samir@icloud.com',
    name: 'Roma',
    nickname: 'Roma',
    avatar: null,
    birth_date: '2006-07-24',
    score: 0,
  },
}

export function login(userId: 'ali' | 'roma'): User {
  const user = USERS[userId]
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('currentUser')
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function logout(): void {
  localStorage.removeItem('currentUser')
}

export function updateProfile(
  _userId: string,
  updates: Partial<Pick<User, 'nickname' | 'birth_date' | 'avatar' | 'score'>>
): User {
  const stored = localStorage.getItem('currentUser')
  if (!stored) throw new Error('No user logged in.')
  const user: User = { ...JSON.parse(stored), ...updates }
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}
