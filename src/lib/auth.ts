import { calculateUserScore } from './data'

const USERS = {
  'aliahmesbiso@gmail.com': {
    id: 'ali-user-id',
    email: 'aliahmesbiso@gmail.com',
    name: 'Ali',
    nickname: 'Ali',
    avatar: null,
    birth_date: '2006-01-19',
    score: 0,
  },
  'romysaa.samir@icloud.com': {
    id: 'roma-user-id',
    email: 'romysaa.samir@icloud.com',
    name: 'Roma',
    nickname: 'Roma',
    avatar: null,
    birth_date: '2006-07-24',
    score: 0,
  },
}

export async function login(email: string) {
  const user = USERS[email as keyof typeof USERS]
  if (!user) {
    throw new Error('Invalid email')
  }
  
  // Calculate user score dynamically
  user.score = calculateUserScore(user.id)
  
  // Store user in localStorage for demo purposes
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  return JSON.parse(userStr)
}

export function logout() {
  localStorage.removeItem('currentUser')
}
