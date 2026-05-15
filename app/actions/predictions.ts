'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const predictionSchema = z.object({
  room_id: z.string().uuid(),
  predictions: z
    .array(
      z.object({
        rank: z.number().int().min(1).max(10),
        contestant_id: z.string().uuid(),
      })
    )
    .length(10, 'You must rank exactly 10 contestants'),
})

export async function savePredictions(
  roomId: string,
  predictions: { rank: number; contestant_id: string }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = predictionSchema.safeParse({ room_id: roomId, predictions })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Check room is not locked
  const { data: room } = await supabase
    .from('rooms')
    .select('locked')
    .eq('id', roomId)
    .single()

  if (!room) return { error: 'Room not found' }
  if (room.locked) return { error: 'Predictions are locked — the show has started!' }

  // Delete existing predictions for this user/room then re-insert
  await supabase.from('predictions').delete().eq('user_id', user.id).eq('room_id', roomId)

  const rows = predictions.map((p) => ({
    user_id: user.id,
    room_id: roomId,
    rank: p.rank,
    contestant_id: p.contestant_id,
  }))

  const { error } = await supabase.from('predictions').insert(rows)
  if (error) return { error: error.message }

  revalidatePath(`/rooms/[code]/predict`, 'page')
  return { success: true }
}

export async function saveFavourites(roomId: string, contestantIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!roomId) return { error: 'Room ID required' }

  // Replace all favourites for this user/room
  await supabase.from('favourites').delete().eq('user_id', user.id).eq('room_id', roomId)

  if (contestantIds.length > 0) {
    const rows = contestantIds.map((contestant_id) => ({
      user_id: user.id,
      room_id: roomId,
      contestant_id,
    }))
    const { error } = await supabase.from('favourites').insert(rows)
    if (error) return { error: error.message }
  }

  revalidatePath(`/rooms/[code]/predict`, 'page')
  return { success: true }
}
