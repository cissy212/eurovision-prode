import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InviteCodeDisplay } from '@/components/rooms/invite-code-display'
import { LockToggle } from '@/components/rooms/lock-toggle'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return { title: `Room ${code} — Eurovision Prode 2026` }
}

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  // Get room
  const { data: room, error } = await service
    .from('rooms')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single()

  if (error || !room) notFound()

  // Check membership
  const { data: membership } = await service
    .from('room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  // Get members with profiles
  const { data: members } = await service
    .from('room_members')
    .select('user_id, joined_at, profiles(display_name)')
    .eq('room_id', room.id)
    .order('joined_at', { ascending: true })

  // Get predictions count per user
  const { data: predictions } = await service
    .from('predictions')
    .select('user_id')
    .eq('room_id', room.id)

  const usersWithPredictions = new Set((predictions ?? []).map((p) => p.user_id))

  // Check if results exist
  const { data: results } = await service
    .from('results')
    .select('id')
    .eq('room_id', room.id)
    .limit(1)

  const hasResults = (results ?? []).length > 0
  const isAdmin = room.admin_user_id === user.id
  const userHasPredictions = usersWithPredictions.has(user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-200 text-sm transition-colors">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{room.name}</h1>
          <div className="flex gap-2 mt-2">
            {isAdmin && <Badge variant="gold">👑 You're the admin</Badge>}
            {room.locked ? (
              <Badge variant="danger">🔒 Predictions locked</Badge>
            ) : (
              <Badge variant="success">🟢 Predictions open</Badge>
            )}
            {hasResults && <Badge variant="gold">🏆 Results published</Badge>}
          </div>
        </div>
      </div>

      {/* Invite code */}
      <div className="glass-card rounded-2xl p-6 space-y-2">
        <p className="text-sm text-purple-400 font-medium">Invite code — share with friends</p>
        <InviteCodeDisplay code={room.invite_code} />
      </div>

      {/* Lock banner */}
      {room.locked && !hasResults && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          🔒 <strong>Predictions are locked.</strong> The competition has started — no more changes allowed.
        </div>
      )}

      {/* Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={`/rooms/${code}/predict`} className="block">
          <div className={`glass-card rounded-xl p-4 text-center space-y-1 hover:border-purple-400/60 transition-all ${room.locked ? 'opacity-60' : ''}`}>
            <div className="text-2xl">🎯</div>
            <div className="text-sm font-semibold text-white">Predict</div>
            {userHasPredictions ? (
              <div className="text-xs text-green-400">✓ Done</div>
            ) : room.locked ? (
              <div className="text-xs text-red-400">Locked</div>
            ) : (
              <div className="text-xs text-yellow-400">Pending</div>
            )}
          </div>
        </Link>

        <Link href={`/rooms/${code}/leaderboard`} className="block">
          <div className="glass-card rounded-xl p-4 text-center space-y-1 hover:border-purple-400/60 transition-all">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-semibold text-white">Leaderboard</div>
            <div className="text-xs text-purple-400">{members?.length ?? 0} players</div>
          </div>
        </Link>

        {hasResults && (
          <Link href={`/rooms/${code}/recap`} className="block">
            <div className="glass-card rounded-xl p-4 text-center space-y-1 hover:border-yellow-400/60 transition-all">
              <div className="text-2xl">🏆</div>
              <div className="text-sm font-semibold text-white">Recap</div>
              <div className="text-xs text-yellow-400">Results out!</div>
            </div>
          </Link>
        )}

        {isAdmin && (
          <Link href={`/rooms/${code}/results`} className="block">
            <div className="glass-card rounded-xl p-4 text-center space-y-1 hover:border-pink-400/60 transition-all">
              <div className="text-2xl">📝</div>
              <div className="text-sm font-semibold text-white">Results</div>
              <div className="text-xs text-pink-400">Admin</div>
            </div>
          </Link>
        )}
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold text-purple-200 text-sm uppercase tracking-wider">Admin controls</h2>
          <LockToggle roomId={room.id} locked={room.locked} />
          <p className="text-xs text-purple-500">
            Lock predictions before the show starts. Unlock to allow changes.
          </p>
        </div>
      )}

      {/* Members list */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-purple-200 text-sm uppercase tracking-wider">
          Members ({members?.length ?? 0})
        </h2>
        <ul className="space-y-2">
          {(members ?? []).map((m) => {
            const profile = m.profiles as unknown as { display_name: string } | null
            const isCurrentUser = m.user_id === user.id
            const hasPreds = usersWithPredictions.has(m.user_id)
            const isMemberAdmin = m.user_id === room.admin_user_id
            return (
              <li key={m.user_id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {(profile?.display_name ?? '?')[0].toUpperCase()}
                  </div>
                  <span className={`text-sm ${isCurrentUser ? 'font-bold text-white' : 'text-purple-200'}`}>
                    {profile?.display_name ?? 'Unknown'}{isCurrentUser ? ' (you)' : ''}
                  </span>
                  {isMemberAdmin && <Badge variant="gold">👑</Badge>}
                </div>
                {hasPreds ? (
                  <Badge variant="success">✓ Predicted</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
