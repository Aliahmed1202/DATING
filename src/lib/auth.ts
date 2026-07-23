import { supabase } from './supabase'
import type { User } from '../types'

// Map email → display name
const NAME_MAP: Record<string, { name: string; nickname: string; birth_date: string }> = {
  'aliahmesbiso@gmail.com': { name: 'Ali', nickname: 'Ali', birth_date: '2006-01-19' },
  'romysaa.samir@icloud.com': { name: 'Roma', nickname: 'Roma', birth_date: '2006-07-24' },
}

/**
 * Sign in with email + password.
 * If the account doesn't exist yet, it is created automatically (first-time setup).
 */
export async function login(email: string, password: string): Promise<User> {
  const normalised = email.trim().toLowerCase()

  if (!NAME_MAP[normalised]) {
    throw new Error('Invalid email. Please use your registered account.')
  }

  // Try sign-in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: normalised,
    password,
  })

  if (!signInError && signInData.user) {
    await ensureProfile(signInData.user.id, normalised)
    return getProfileById(signInData.user.id)
  }

  // If "Invalid login credentials" it might be a first-time user — try sign-up
  if (signInError?.message?.toLowerCase().includes('invalid login credentials')) {
    const meta = NAME_MAP[normalised]
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalised,
      password,
      options: {
        data: { name: meta.name, nickname: meta.nickname },
      },
    })

    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message || 'Failed to create account.')
    }

    await ensureProfile(signUpData.user.id, normalised)
    return getProfileById(signUpData.user.id)
  }

  throw new Error(signInError?.message || 'Login failed.')
}

/**
 * Get the currently authenticated Supabase session and return the profile.
 * Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  try {
    return await getProfileById(session.user.id)
  } catch {
    return null
  }
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

/**
 * Internal: upsert profile row on first login.
 */
async function ensureProfile(userId: string, email: string): Promise<void> {
  const meta = NAME_MAP[email.toLowerCase()]
  if (!meta) return

  await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      name: meta.name,
      nickname: meta.nickname,
      birth_date: meta.birth_date,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}
