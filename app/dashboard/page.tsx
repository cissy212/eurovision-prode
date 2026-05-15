import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoomCard } from '@/components/rooms/room-card'
import { DashboardActions } from '@/components/rooms/dashboard-actions'

export const metadata = {
  title: 'Dashboard — Eurovision Prode 2026',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  // Get rooms the user is a member of
  const { data: memberships } = await supabase
    .from('room_members')
    .select('room_id, joined_at')
    .eq('user_id', user.id)

  const roomIds = (memberships ?? []).map((m) => m.room_id)

  let rooms: Array<{
    room: { id: string; name: string; invite_code: string; admin_user_id: string; locked: boolean; created_at: string }
    memberCount: number
    isAdmin: boolean
    hasPredictions: boolean
  }> = []

  if (roomIds.length > 0) {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .in('id', roomIds)
      .order('created_at', { ascending: false })

    if (roomData) {
      // Get member counts for all rooms
      const { data: allMembers } = await supabase
        .from('room_members')
        .select('room_id')
        .in('room_id', roomIds)

      // Get user's predictions (to know if they've submitted)
      const { data: userPredictions } = await supabase
        .from('predictions')
        .select('room_id')
        .eq('user_id', user.id)
        .in('room_id', roomIds)

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
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">
          Hello, {profile?.display_name ?? 'Eurovision fan'} 👋
        </h1>
        <p className="text-purple-400">
          Eurovision 2026 Grand Final — Vienna, May 16th
        </p>
      </div>

      {/* Actions */}
      <DashboardActions />

      {/* Rooms list */}
      {rooms.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-3">
          <div className="text-5xl">🎵</div>
          <h2 className="font-bold text-white text-xl">No rooms yet</h2>
          <p className="text-purple-400 text-sm">
            Create a room and invite your friends, or join one with an invite code.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
            Your rooms ({rooms.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {rooms.map(({ room, memberCount, isAdmin, hasPredictions }) => (
              <RoomCard
                key={room.id}
                room={room}
                memberCount={memberCount}
                isAdmin={isAdmin}
                hasPredictions={hasPredictions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
