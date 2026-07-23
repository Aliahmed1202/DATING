import { supabase } from './supabase'
import { Memory, Event, Note, Media, Level, Relationship } from '../types'

// ============================================================
// LEVELS
// ============================================================
export const levels: Level[] = [
  { name: 'Our Beginning', min_points: 0, max_points: 99 },
  { name: 'Getting Closer', min_points: 100, max_points: 249 },
  { name: 'Strong Bond', min_points: 250, max_points: 499 },
  { name: 'Growing Together', min_points: 500, max_points: 999 },
  { name: 'Our World', min_points: 1000, max_points: Infinity },
]

// ============================================================
// RELATIONSHIP (derived from memories + events)
// ============================================================
export async function getRelationship(): Promise<Relationship> {
  const startDate = await calculateRelationshipStartDate()
  const score = await calculateRelationshipScore()
  return {
    id: 'rel-1',
    name: 'Ali & Roma',
    type: 'Dating',
    start_date: startDate,
    cover_photo: null,
    score,
  }
}

export async function calculateRelationshipStartDate(): Promise<string> {
  const [{ data: memories }, { data: events }] = await Promise.all([
    supabase.from('memories').select('created_at').order('created_at', { ascending: true }).limit(1),
    supabase.from('events').select('created_at').order('created_at', { ascending: true }).limit(1),
  ])

  const dates: string[] = []
  if (memories?.[0]?.created_at) dates.push(memories[0].created_at)
  if (events?.[0]?.created_at) dates.push(events[0].created_at)

  if (dates.length === 0) return new Date().toISOString()
  return dates.sort()[0]
}

export async function calculateDaysTogether(): Promise<number> {
  const startDate = await calculateRelationshipStartDate()
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ============================================================
// SCORES
// ============================================================
export async function calculateRelationshipScore(): Promise<number> {
  const [{ count: memCount }, { count: evtCount }, { count: noteCount }] = await Promise.all([
    supabase.from('memories').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
  ])
  return ((memCount ?? 0) * 10) + ((evtCount ?? 0) * 5) + ((noteCount ?? 0) * 3)
}

export async function calculateUserScore(userId: string): Promise<number> {
  const [{ count: memCount }, { count: evtCount }, { count: noteCount }] = await Promise.all([
    supabase.from('memories').select('*', { count: 'exact', head: true }).eq('created_by', userId),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('created_by', userId),
    supabase.from('notes').select('*', { count: 'exact', head: true }).eq('sender_id', userId),
  ])
  return ((memCount ?? 0) * 10) + ((evtCount ?? 0) * 5) + ((noteCount ?? 0) * 3)
}

export async function syncUserScore(userId: string): Promise<number> {
  const score = await calculateUserScore(userId)
  await supabase.from('profiles').update({ score }).eq('id', userId)
  return score
}

// ============================================================
// MEDIA HELPER — fetch separately to avoid polymorphic join error
// ============================================================
async function fetchMedia(parentIds: string[]): Promise<Map<string, Media[]>> {
  if (parentIds.length === 0) return new Map()
  const { data } = await supabase
    .from('media')
    .select('*')
    .in('parent_id', parentIds)
  const map = new Map<string, Media[]>()
  for (const row of data ?? []) {
    if (!map.has(row.parent_id)) map.set(row.parent_id, [])
    map.get(row.parent_id)!.push(row as Media)
  }
  return map
}

// ============================================================
// MEMORIES
// ============================================================
export async function getMemories(): Promise<Memory[]> {
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('memory_date', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = data ?? []
  const mediaMap = await fetchMedia(rows.map(r => r.id))
  return rows.map(row => rowToMemory(row, mediaMap.get(row.id) ?? []))
}

export async function insertMemory(
  payload: Omit<Memory, 'id' | 'created_at' | 'media'>
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .insert({
      title: payload.title,
      description: payload.description,
      memory_type: payload.memory_type,
      memory_date: payload.memory_date,
      mood: payload.mood,
      photo_url: payload.photo_url,
      created_by: payload.created_by,
      points: payload.points,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to create memory.')
  return rowToMemory(data, [])
}

export async function updateMemory(
  id: string,
  payload: Partial<Omit<Memory, 'id' | 'created_at' | 'media'>>
): Promise<Memory> {
  const { data, error } = await supabase
    .from('memories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to update memory.')
  const mediaMap = await fetchMedia([id])
  return rowToMemory(data, mediaMap.get(id) ?? [])
}

export async function deleteMemory(id: string): Promise<void> {
  const { error } = await supabase.from('memories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ============================================================
// EVENTS
// ============================================================
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)
  const rows = data ?? []
  const mediaMap = await fetchMedia(rows.map(r => r.id))
  return rows.map(row => rowToEvent(row, mediaMap.get(row.id) ?? []))
}

export async function insertEvent(
  payload: Omit<Event, 'id' | 'created_at' | 'media'>
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: payload.title,
      event_type: payload.event_type,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      description: payload.description,
      repeat_yearly: payload.repeat_yearly,
      status: payload.status,
      created_by: payload.created_by,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to create event.')
  return rowToEvent(data, [])
}

export async function updateEvent(
  id: string,
  payload: Partial<Omit<Event, 'id' | 'created_at' | 'media'>>
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to update event.')
  const mediaMap = await fetchMedia([id])
  return rowToEvent(data, mediaMap.get(id) ?? [])
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ============================================================
// NOTES
// ============================================================
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  const rows = data ?? []
  const mediaMap = await fetchMedia(rows.map(r => r.id))
  return rows.map(row => rowToNote(row, mediaMap.get(row.id) ?? []))
}

export async function insertNote(
  payload: Omit<Note, 'id' | 'created_at' | 'media'>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      sender_id: payload.sender_id,
      receiver_id: payload.receiver_id,
      type: payload.type,
      message: payload.message,
      read: payload.read,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to create note.')
  return rowToNote(data, [])
}

export async function updateNote(
  id: string,
  payload: Partial<Omit<Note, 'id' | 'created_at' | 'media'>>
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to update note.')
  const mediaMap = await fetchMedia([id])
  return rowToNote(data, mediaMap.get(id) ?? [])
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ============================================================
// MEDIA
// ============================================================
export async function insertMediaRecord(record: {
  parent_id: string
  parent_type: 'memory' | 'event' | 'note'
  type: 'image' | 'video'
  url: string
  file_path: string
  name: string
  size: number
  uploaded_by: string
}): Promise<Media> {
  const { data, error } = await supabase
    .from('media')
    .insert(record)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to save media record.')
  return data as Media
}

export async function deleteMediaRecord(mediaId: string): Promise<void> {
  const { error } = await supabase.from('media').delete().eq('id', mediaId)
  if (error) throw new Error(error.message)
}

// ============================================================
// UTILITY
// ============================================================
export async function getPartnerProfiles(currentUserId: string): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase
    .from('profiles')
    .select('id, name')
    .neq('id', currentUserId)
  return data ?? []
}

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

// ============================================================
// ROW MAPPERS
// ============================================================
function rowToMemory(row: any, media: Media[]): Memory {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    memory_type: row.memory_type,
    memory_date: row.memory_date,
    mood: row.mood ?? 'happy',
    photo_url: row.photo_url ?? null,
    created_by: row.created_by,
    created_at: row.created_at,
    points: row.points ?? 10,
    media,
  }
}

function rowToEvent(row: any, media: Media[]): Event {
  return {
    id: row.id,
    title: row.title,
    event_type: row.event_type,
    date: row.date,
    time: row.time ?? null,
    location: row.location ?? null,
    description: row.description ?? null,
    repeat_yearly: row.repeat_yearly ?? false,
    status: row.status ?? 'upcoming',
    created_by: row.created_by,
    created_at: row.created_at,
    media,
  }
}

function rowToNote(row: any, media: Media[]): Note {
  return {
    id: row.id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    type: row.type,
    message: row.message,
    read: row.read ?? false,
    created_at: row.created_at,
    media,
  }
}
