'use server'

import { createClient } from '@/lib/supabase/server'
import { generateInviteCode } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createRoomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters').max(60),
})

export async function createRoom(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = createRoomSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const inviteCode = generateInviteCode()

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      name: parsed.data.name,
      invite_code: inviteCode,
      admin_user_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Admin joins as first member
  await supabase.from('room_members').insert({ room_id: room.id, user_id: user.id })

  revalidatePath('/dashboard')
  redirect(`/rooms/${room.invite_code}`)
}

export async function joinRoom(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const code = (formData.get('invite_code') as string)?.trim().toUpperCase()
  if (!code) return { error: 'Please enter an invite code' }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select()
    .eq('invite_code', code)
    .single()

  if (roomError || !room) return { error: 'Room not found. Check your invite code.' }

  // Already a member?
  const { data: existing } = await supabase
    .from('room_members')
    .select()
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    redirect(`/rooms/${room.invite_code}`)
  }

  const { error: joinError } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: user.id })

  if (joinError) return { error: joinError.message }

  revalidatePath('/dashboard')
  redirect(`/rooms/${room.invite_code}`)
}

export async function lockRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('rooms')
    .update({ locked: true })
    .eq('id', roomId)
    .eq('admin_user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/rooms/[code]', 'page')
  return { success: true }
}

export async function unlockRoom(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('rooms')
    .update({ locked: false })
    .eq('id', roomId)
    .eq('admin_user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/rooms/[code]', 'page')
  return { success: true }
}
