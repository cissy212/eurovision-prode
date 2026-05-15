import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ContestantCard } from '@/components/contestants/contestant-card'
import { Badge } from '@/components/ui/badge'
import { Confetti } from '@/components/leaderboard/confetti'
import { cn } from '@/lib/utils'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return { title: `Recap — Room ${code} — Eurovision Prode 2026` }
}

export default async function RecapPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  const { data: room } = await service
    .from('rooms')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single()

  if (!room) notFound()

  // Check membership
  const { data: membership } = await service
    .from('room_members')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  // Get official results
  const { data: results } = await service
    .from('results')
    .select('rank, contestant_id, contestants(*)')
    .eq('room_id', room.id)
    .order('rank', { ascending: true })

  if (!results || results.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h1 className="text-2xl font-bold text-white">Results not published yet</h1>
        <Link href={`/rooms/${code}`} className="text-purple-400 hover:text-purple-200">
          ← Back to room
        </Link>
      </div>
    )
  }

  // Get all members, scores, predictions
  const { data: members } = await service
    .from('room_members')
    .select('user_id, profiles(display_name)')
    .eq('room_id', room.id)

  const { data: scores } = await service
    .from('scores')
    .select('*')
    .eq('room_id', room.id)

  const scoreMap = new Map((scores ?? []).map((s) => [s.user_id, s]))
  const sortedMembers = (members ?? []).sort((a, b) => {
    const sa = scoreMap.get(a.user_id)?.total_score ?? 0
    const sb = scoreMap.get(b.user_id)?.total_score ?? 0
    return sb - sa
  })

  // Get predictions for all members
  const memberIds = sortedMembers.map((m) => m.user_id)
  const { data: allPredictions } = await service
    .from('predictions')
    .select('user_id, rank, contestant_id')
    .eq('room_id', room.id)
    .in('user_id', memberIds)

  // Get favourites for all members
  const { data: allFavourites } = await service
    .from('favourites')
    .select('user_id, contestant_id')
    .eq('room_id', room.id)
    .in('user_id', memberIds)

  // Build prediction maps per user
  const predsByUser = new Map<string, Map<number, string>>()
  for (const p of allPredictions ?? []) {
    if (!predsByUser.has(p.user_id)) predsByUser.set(p.user_id, new Map())
    predsByUser.get(p.user_id)!.set(p.rank, p.contestant_id)
  }

  const favsByUser = new Map<string, Set<string>>()
  for (const f of allFavourites ?? []) {
    if (!favsByUser.has(f.user_id)) favsByUser.set(f.user_id, new Set())
    favsByUser.get(f.user_id)!.add(f.contestant_id)
  }

  const resultContestantIds = new Set(results.map((r) => r.contestant_id))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <Confetti />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-6xl">🏆</div>
        <h1 className="text-4xl font-extrabold text-gradient-euro">Eurovision 2026 Recap</h1>
        <p className="text-purple-400">{room.name}</p>
        <Link href={`/rooms/${code}/leaderboard`} className="inline-block mt-2">
          <Badge variant="gold">View Leaderboard →</Badge>
        </Link>
      </div>

      {/* Official results */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-purple-200 text-sm uppercase tracking-wider">
          🏆 Official Eurovision 2026 Top 10
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {results.map((r) => {
            const c = r.contestants as unknown as { id: string; country: string; artist: string; song: string; flag_emoji: string; photo_url: string | null; running_order: number | null; created_at: string }
            if (!c) return null
            return <ContestantCard key={r.contestant_id} contestant={c} rank={r.rank} />
          })}
        </div>
      </div>

      {/* Per-user predictions comparison */}
      <div className="space-y-6">
        <h2 className="font-bold text-white text-xl">Everyone&apos;s predictions</h2>
        {sortedMembers.map((member, idx) => {
          const profile = member.profiles as unknown as { display_name: string } | null
          const score = scoreMap.get(member.user_id)
          const userPreds = predsByUser.get(member.user_id)
          const userFavs = favsByUser.get(member.user_id) ?? new Set()
          const isCurrentUser = member.user_id === user.id

          return (
            <div key={member.user_id} className={cn('glass-card rounded-2xl p-5 space-y-4', isCurrentUser && 'border-pink-400/40')}>
              {/* User header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm',
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-red-600' :
                    'bg-gradient-to-br from-pink-500 to-purple-600'
                  )}>
                    {(profile?.display_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={cn('font-bold', isCurrentUser ? 'text-pink-300' : 'text-white')}>
                      {profile?.display_name ?? 'Unknown'}{isCurrentUser ? ' (you)' : ''}
                      {idx === 0 && ' 🥇'}
                      {idx === 1 && ' 🥈'}
                      {idx === 2 && ' 🥉'}
                    </div>
                    {score && (
                      <div className="text-xs text-purple-400">
                        {score.total_score} pts · {score.in_top10} in top 10 · {score.exact_matches} exact
                      </div>
                    )}
                  </div>
                </div>

                {userFavs.size > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-purple-500">Favourites:</span>
                    {Array.from(userFavs).map((cid) => {
                      const result = results.find((r) => r.contestant_id === cid)
                      const c = result?.contestants as { flag_emoji?: string } | undefined
                      if (!c) {
                        // find from results
                        return null
                      }
                      return (
                        <span key={cid} className="text-lg" title="Favourite">
                          {c.flag_emoji}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Their predictions vs official */}
              {userPreds ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {Array.from({ length: 10 }, (_, i) => {
                    const rank = i + 1
                    const predictedContestantId = userPreds.get(rank)
                    const officialAtRank = results.find((r) => r.rank === rank)
                    const officialContestant = officialAtRank?.contestants as { id: string; country: string; artist: string; song: string; flag_emoji: string; photo_url: string | null; running_order: number | null; created_at: string } | undefined

                    const isExact = predictedContestantId === officialAtRank?.contestant_id
                    const isInTop10 = predictedContestantId ? resultContestantIds.has(predictedContestantId) : false

                    // Find predicted contestant from all results
                    const predictedResult = results.find((r) => r.contestant_id === predictedContestantId)
                    const predictedContestant = predictedResult?.contestants as { id: string; country: string; artist: string; song: string; flag_emoji: string; photo_url: string | null; running_order: number | null; created_at: string } | undefined

                    return (
                      <div key={rank} className={cn(
                        'rounded-xl border p-2.5 flex items-center gap-2',
                        isExact ? 'border-yellow-400/50 bg-yellow-400/10' :
                        isInTop10 ? 'border-green-400/40 bg-green-400/8' :
                        'border-red-500/30 bg-red-500/5'
                      )}>
                        <div className="rank-badge flex-shrink-0 text-xs">{rank}</div>
                        {predictedContestant ? (
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xl">{predictedContestant.flag_emoji}</span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">{predictedContestant.artist}</div>
                              <div className="text-xs text-purple-400 truncate">{predictedContestant.country}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-purple-600">—</span>
                        )}
                        <div className="flex-shrink-0 text-sm">
                          {isExact ? '⭐' : isInTop10 ? '✅' : '❌'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-purple-600">No predictions submitted</p>
              )}

              {/* Legend */}
              <div className="flex gap-4 text-xs text-purple-500">
                <span>⭐ Exact rank (+3 pts)</span>
                <span>✅ In top 10 (+1 pt)</span>
                <span>❌ Not in top 10</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
