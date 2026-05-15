import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { Badge } from '@/components/ui/badge'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return { title: `Leaderboard — Room ${code} — Eurovision Prode 2026` }
}

export default async function LeaderboardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  const { data: room } = await service
    .from('rooms').select('*').eq('invite_code', code.toUpperCase()).single()

  if (!room) notFound()

  const { data: membership } = await service
    .from('room_members').select('id').eq('room_id', room.id).eq('user_id', user.id).single()

  if (!membership) redirect('/dashboard')

  const { data: members } = await service
    .from('room_members').select('user_id, profiles(display_name)').eq('room_id', room.id)

  const { data: scores } = await service
    .from('scores').select('*').eq('room_id', room.id)

  const { data: predictions } = await service
    .from('predictions').select('user_id').eq('room_id', room.id)

  const usersWithPredictions = new Set((predictions ?? []).map((p) => p.user_id))
  const hasResults = scores && scores.length > 0
  const scoreMap = new Map((scores ?? []).map((s) => [s.user_id, s]))

  const entries = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as { display_name: string } | null
    const score = scoreMap.get(m.user_id)
    return {
      userId: m.user_id,
      displayName: profile?.display_name ?? 'Unknown',
      totalScore: score?.total_score ?? 0,
      exactMatches: score?.exact_matches ?? 0,
      inTop10: score?.in_top10 ?? 0,
      isCurrentUser: m.user_id === user.id,
      hasPredictions: usersWithPredictions.has(m.user_id),
    }
  })

  const sorted = entries.sort((a, b) =>
    hasResults ? b.totalScore - a.totalScore : a.displayName.localeCompare(b.displayName)
  )
  const withRanks = sorted.map((e, i) => ({ ...e, rank: i + 1 }))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <Link href={`/rooms/${code}`} className="text-purple-400 hover:text-purple-200 text-sm">← {room.name}</Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-3xl font-extrabold text-white">Leaderboard 📊</h1>
          {hasResults ? <Badge variant="gold">🏆 Final scores</Badge> : <Badge variant="warning">⏳ Awaiting results</Badge>}
        </div>
        <p className="text-purple-400 text-sm mt-1">
          {members?.length ?? 0} players · {usersWithPredictions.size} predictions submitted
        </p>
      </div>

      {!hasResults && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-300">
          Results haven&apos;t been published yet. Scores will appear here once the admin enters the official Eurovision Top 10.
        </div>
      )}

      <LeaderboardTable entries={withRanks} />

      {hasResults && (
        <div className="text-center">
          <Link href={`/rooms/${code}/recap`} className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-400 hover:to-purple-500 transition-all glow-pink">
            View full recap 🎉
          </Link>
        </div>
      )}
    </div>
  )
}
