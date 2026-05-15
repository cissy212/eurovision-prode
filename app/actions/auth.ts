'use server'

import { signInByName, setSessionCookie, clearSessionCookie } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const displayName = (formData.get('display_name') as string)?.trim()

  if (!displayName || displayName.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }
  if (displayName.length > 30) {
    return { error: 'Name must be 30 characters or less' }
  }

  const result = await signInByName(displayName)

  if ('error' in result) return { error: result.error }

  await setSessionCookie(result)
  redirect('/dashboard')
}

export async function signOut() {
  await clearSessionCookie()
  redirect('/')
}
