import { supabase } from './supabase'
import type { User } from '../types'

// Fixed internal passwords — users never see or type these
const ACCOUNTS: Record<string, { name: string; nickname: string; birth_date: string; password: string }> = {
  'aliahmesbiso@gmail.com': {
    name: 'Ali',
    nickname: 'Ali',
    birth_date: '2006-01-19',
    password: 'ali-roma-app-2024!',
  },
  'romysaa.samir@icloud.com': {
    name: 'Roma',
    nickname: 'Roma',
    birth_date: '2006-07-24',
    password: 'roma-ali-app-2024!',
  },
}

/**
 * One-tap login — user just picks their name, no password input.
 * Works even if the profiles table doesn't exist yet.
 */
export async function login(email: string): Promise<User> {
  const normalised = email.trim().toLowerCase()
  const account = ACCOUNTS[normalised]

  if (!account) throw new Error('Invalid account.')

  // Try sign in
  let userId: string | null = null

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: normalised,
    password: account.password,
  })

  if (!signInError && signInData.user) {
    userId = signInData.user.id
  } else if (signInError?.message?.toLowerCase().includes('invalid login credentials')) {
    // First time — create the account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalised,
      password: account.password,
      options: { data: { name: account.name, nickname: account.nickname } },
    })

    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message || 'Failed to create account.')
    }
    userId = signUpData.user.id
  } else {
    throw new Error(signInError?.message || 'Login failed.')
  }

  // Try to save/fetch profile from DB — but never fail login if DB isn't ready
  try {
    await supabase.from('profiles').upsert(
      {
        id: userId,
        email: normalised,
        name: account.name,
        nickname: account.nickname,
        birth_date: account.birth_date,
        score: 0,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        nickname: profile.nickname,
        avatar: profile.avatar ?? null,
        birth_date: profile.birth_date ?? null,
        score: profile.score ?? 0,
      }
    }
  } catch {
    // DB not set up yet — fall through to local user object
  }

  // Fallback: build user from hardcoded data so login always succeeds
  return {
    id: userId,
    email: normalised,
    name: account.name,
    nickname: account.nickname,
    avatar: null,
    birth_date: account.birth_date,
    score: 0,
  }
}

/**
 * Get the currently authenticated Supabase session and return the profile.
 * Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const email = session.user.email?.toLowerCase() ?? ''
  const account = ACCOUNTS[email]

  // Try DB first
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        nickname: profile.nickname,
        avatar: profile.avatar ?? null,
        birth_date: profile.birth_date ?? null,
        score: profile.score ?? 0,
      }
    }
  } catch {
    // DB not ready yet
  }

  // Fallback to hardcoded data
  if (account) {
    return {
      id: session.user.id,
      email,
      name: account.name,
      nickname: account.nickname,
      avatar: null,
      birth_date: account.birth_date,
      score: 0,
    }
  }

  return null
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Fetch a profile row by user id.
 */
export async function getProfileById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('Profile not found.')

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    avatar: data.avatar ?? null,
    birth_date: data.birth_date ?? null,
    score: data.score ?? 0,
  }
}

/**
 * Update the current user's profile in Supabase.
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

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    avatar: data.avatar ?? null,
    birth_date: data.birth_date ?? null,
    score: data.score ?? 0,
  }
}
