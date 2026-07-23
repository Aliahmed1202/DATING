import { supabase } from './supabase'
import type { User } from '../types'

// The two allowed emails for this private app
const ALLOWED_EMAILS = ['aliahmesbiso@gmail.com', 'romysaa.samir@icloud.com']

// Map email → display name (used when creating profile on first login)
const NAME_MAP: Record<string, { name: string; nickname: string; birth_date: string }> = {
  'aliahmesbiso@gmail.com': { name: 'Ali', nickname: 'Ali', birth_date: '2006-01-19' },
  'romysaa.samir@icloud.com': { name: 'Roma', nickname: 'Roma', birth_date: '2006-07-24' },
}

/**
 * Sign in with email OTP (magic link / 6-digit code).
 * Supabase sends a one-time code to the user's email.
 */
export async function login(email: string): Promise<void> {
  const normalised = email.trim().toLowerCase()

  if (!ALLOWED_EMAILS.includes(normalised)) {
    throw new Error('Invalid email. Please use your registered account.')
  }

  const meta = NAME_MAP[normalised]

  const { error } = await supabase.auth.signInWithOtp({
    email: normalised,
    options: {
      shouldCreateUser: true,
      data: {
        name: meta.name,
        nickname: meta.nickname,
      },
    },
  })

  if (error) throw new Error(error.message)
}

/**
 * Verify the OTP code sent to the user's email.
 * Returns the full User profile on success.
 */
export async function verifyOtp(email: string, token: string): Promise<User> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: 'email',
  })

  if (error || !data.user) {
    throw new Error(error?.message || 'Invalid or expired code.')
  }

  // Ensure profile row exists (trigger handles it, but race-condition safety)
  await ensureProfile(data.user.id, data.user.email!)

  const profile = await getProfileById(data.user.id)
  return profile
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
 * Fetch a profile row by user id and return it as a User object.
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
 * Internal: create profile row if it doesn't exist yet.
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
