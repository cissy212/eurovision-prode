import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { RoomCard } from '@/components/rooms/room-card'
import { DashboardActions } from '@/components/rooms/dashboard-actions'

export const metadata = { title: 'Dashboard — Eurovision Prode 2026' }

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  const { data: memberships } = await service
    .from('room_members').select('room_id').eq('user_id', user.id)

  const roomIds = (memberships ?? []).map((m) => m.room_id)

  let rooms: Array<{
    room: { id: string; name: string; invite_code: string; admin_user_id: string; locked: boolean; created_at: string }
    memberCount: number
    isAdmin: boolean
    hasPredictions: boolean
  }> = []

  if (roomIds.length > 0) {
    const { data: roomData } = await service
      .from('rooms').select('*').in('id', roomIds).order('created_at', { ascending: false })

    if (roomData) {
      const { data: allMembers } = await service
        .from('room_members').select('room_id').in('room_id', roomIds)

      const { data: userPredictions } = await service
        .from('predictions').select('room_id').eq('user_id', user.id).in('room_id', roomIds)

      const predictionRoomIds = new Set((userPredictions ?? []).map((p) => p.room_id))

      rooms = roomData.map((room) => ({
        room,
        memberCount: (allMembers ?? []).filter((m) => m.room_id === room.id).length,
        isAdmin: room.admin_user_id === user.id,
        hasPredictions: predictionRoomIds.has(room.id),
      }))
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">Hello, {user.display_name} 👋</h1>
        <p className="text-purple-400">Eurovision 2026 Grand Final — Vienna, May 16th</p>
      </div>

      <DashboardActions />

      {rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-3">
          <div className="text-5xl">🎵</div>
          <h2 className="font-bold text-white text-xl">No rooms yet</h2>
          <p className="text-purple-400 text-sm">Create a room and invite your friends, or join one with an invite code.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Your rooms ({rooms.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {rooms.map(({ room, memberCount, isAdmin, hasPredictions }) => (
              <RoomCard key={room.id} room={room} memberCount={memberCount} isAdmin={isAdmin} hasPredictions={hasPredictions} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
