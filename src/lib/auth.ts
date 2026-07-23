import { supabase } from './supabase'
import type { User } from '../types'

// Fixed internal passwords — users never see or type these
const ACCOUNTS: Record<string, { name: string; nickname: string; birth_date: string; password: string }> = {
  'aliahmesbiso@gmail.com': {
    name: 'Ali',
    nickname: 'Ali',
    birth_date: '2006-01-19',
    password: 'ali-roma-ourspace-2024!',
  },
  'romysaa.samir@icloud.com': {
    name: 'Roma',
    nickname: 'Roma',
    birth_date: '2006-07-24',
    password: 'roma-ali-ourspace-2024!',
  },
}

const USER_KEYS = Object.keys(ACCOUNTS)

/**
 * One-tap login — picks account by name key ('ali' | 'roma').
 * Uses Supabase password auth behind the scenes so we get a real UUID.
 */
export async function login(key: 'ali' | 'roma'): Promise<User> {
  const email = key === 'ali' ? USER_KEYS[0] : USER_KEYS[1]
  const account = ACCOUNTS[email]

  // Try sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: account.password,
  })

  if (!signInError && signInData.user) {
    return upsertAndReturn(signInData.user.id, email, account)
  }

  // First time — sign up
  if (signInError?.message?.toLowerCase().includes('invalid login credentials')) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: account.password,
      options: { data: { name: account.name, nickname: account.nickname } },
    })
    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message || 'Failed to create account.')
    }
    return upsertAndReturn(signUpData.user.id, email, account)
  }

  throw new Error(signInError?.message || 'Login failed.')
}

async function upsertAndReturn(
  userId: string,
  email: string,
  account: typeof ACCOUNTS[string]
): Promise<User> {
  // Upsert profile row with real UUID
  await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      name: account.name,
      nickname: account.nickname,
      birth_date: account.birth_date,
      score: 0,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  const user: User = {
    id: userId,
    email,
    name: account.name,
    nickname: account.nickname,
    avatar: null,
    birth_date: account.birth_date,
    score: 0,
  }

  // Try to get fresh data from DB (avatar, score, etc.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profile) {
    user.avatar = profile.avatar ?? null
    user.birth_date = profile.birth_date ?? account.birth_date
    user.score = profile.score ?? 0
    user.nickname = profile.nickname ?? account.nickname
  }

  // Clear any stale localStorage data that has old non-UUID ids
  localStorage.removeItem('currentUser')
  localStorage.removeItem('memories')
  localStorage.removeItem('events')
  localStorage.removeItem('notes')

  // Store in localStorage for synchronous getCurrentUser()
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}

/**
 * Returns the current user from localStorage (synchronous).
 */
export function getCurrentUser(): User | null {
  const stored = localStorage.getItem('currentUser')
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

/**
 * Sign out.
 */
export function logout(): void {
  localStorage.removeItem('currentUser')
  supabase.auth.signOut()
}

/**
 * Update profile in Supabase and refresh localStorage.
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'nickname' | 'birth_date' | 'avatar' | 'score'>>
): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to update profile.')

  const user: User = {
    id: data.id,
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    avatar: data.avatar ?? null,
    birth_date: data.birth_date ?? null,
    score: data.score ?? 0,
  }

  localStorage.setItem('currentUser', JSON.stringify(user))
  window.dispatchEvent(new Event('user-updated'))
  return user
}
