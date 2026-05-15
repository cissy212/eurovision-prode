'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/session'
import { computeUserScore } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const resultsSchema = z.object({
  room_id: z.string().uuid(),
  results: z
    .array(z.object({ rank: z.number().int().min(1).max(10), contestant_id: z.string().uuid() }))
    .length(10, 'Must enter exactly 10 results'),
})

export async function publishResults(
  roomId: string,
  results: { rank: number; contestant_id: string }[]
) {
  const user = await getSessionUser()
  if (!user) return { error: 'Not logged in' }

  const parsed = resultsSchema.safeParse({ room_id: roomId, results })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const service = await createServiceClient()

  const { data: room } = await service.from('rooms').select('admin_user_id').eq('id', roomId).single()
  if (!room || room.admin_user_id !== user.id) return { error: 'Only the room admin can publish results' }

  await service.from('results').delete().eq('room_id', roomId)
  const { error: insertError } = await service.from('results').insert(
    results.map((r) => ({ room_id: roomId, rank: r.rank, contestant_id: r.contestant_id }))
  )
  if (insertError) return { error: insertError.message }

  // Compute scores for all members
  const { data: members } = await service.from('room_members').select('user_id').eq('room_id', roomId)
  for (const member of members ?? []) {
    const { data: userPredictions } = await service
      .from('predictions')
      .select('rank, contestant_id')
      .eq('user_id', member.user_id)
      .eq('room_id', roomId)

    const score = computeUserScore(userPredictions ?? [], results)
    await service.from('scores').upsert(
      { user_id: member.user_id, room_id: roomId, ...score, computed_at: new Date().toISOString() },
      { onConflict: 'user_id,room_id' }
    )
  }

  revalidatePath(`/rooms/[code]/leaderboard`, 'page')
  revalidatePath(`/rooms/[code]/results`, 'page')
  return { success: true }
}
