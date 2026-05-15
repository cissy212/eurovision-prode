'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const displayName = formData.get('display_name') as string

  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: { display_name: displayName || email.split('@')[0] },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function updateDisplayName(formData: FormData) {
  const displayName = formData.get('display_name') as string
  if (!displayName?.trim()) return { error: 'Display name cannot be empty' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName.trim() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
