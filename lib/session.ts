import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

const COOKIE_NAME = 'euro_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionUser {
  id: string
  display_name: string
}

/** Read the current session from the cookie and verify the user exists in DB */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { id: string; display_name: string }
    if (!parsed.id || !parsed.display_name) return null
    return parsed
  } catch {
    return null
  }
}

/** Set the session cookie (call from Route Handler or Server Action) */
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

/** Clear the session cookie */
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Sign in or register a user by display name.
 * Returns the user if successful, or an error string.
 */
export async function signInByName(displayName: string): Promise<SessionUser | { error: string }> {
  const name = displayName.trim()
  if (!name || name.length < 2) return { error: 'Name must be at least 2 characters' }
  if (name.length > 30) return { error: 'Name must be 30 characters or less' }

  const service = await createServiceClient()

  // Check if name is already taken by someone else (case-insensitive)
  const { data: existing } = await service
    .from('profiles')
    .select('id, display_name')
    .ilike('display_name', name)
    .single()

  if (existing) {
    // Name exists — log them in as that user (same name = same person)
    return { id: existing.id, display_name: existing.display_name }
  }

  // New user — create profile
  const { data: created, error } = await service
    .from('profiles')
    .insert({ display_name: name })
    .select('id, display_name')
    .single()

  if (error || !created) return { error: 'Could not create account. Please try again.' }

  return { id: created.id, display_name: created.display_name }
}
