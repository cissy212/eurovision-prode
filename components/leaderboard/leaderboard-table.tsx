import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  totalScore: number
  exactMatches: number
  inTop10: number
  isCurrentUser: boolean
  hasPredictions: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center space-y-3">
        <div className="text-5xl">👀</div>
        <p className="text-purple-400">No scores yet — results haven&apos;t been published.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => (
        <div
          key={entry.userId}
          className={cn(
            'glass-card rounded-2xl px-5 py-4 flex items-center gap-4 transition-all',
            entry.isCurrentUser && 'border-pink-400/40 glow-pink',
            idx === 0 && 'glow-gold'
          )}
        >
          {/* Position */}
          <div className="w-8 text-center flex-shrink-0">
            {idx < 3 ? (
              <span className="text-2xl">{MEDALS[idx]}</span>
            ) : (
              <span className="text-lg font-bold text-purple-500">{entry.rank}</span>
            )}
          </div>

          {/* Avatar */}
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0',
              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-red-600' :
              'bg-gradient-to-br from-pink-500 to-purple-600'
            )}
          >
            {entry.displayName[0]?.toUpperCase() ?? '?'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className={cn('font-semibold text-sm truncate', entry.isCurrentUser ? 'text-pink-300' : 'text-white')}>
              {entry.displayName}
              {entry.isCurrentUser && <span className="text-purple-400 font-normal ml-1">(you)</span>}
            </div>
            {!entry.hasPredictions && (
              <div className="text-xs text-purple-500">No predictions submitted</div>
            )}
          </div>

          {/* Score breakdown */}
          {entry.hasPredictions ? (
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center hidden sm:block">
                <div className="text-xs text-purple-500">Top 10</div>
                <div className="font-bold text-purple-200">{entry.inTop10}</div>
              </div>
              <div className="text-center hidden sm:block">
                <div className="text-xs text-purple-500">Exact</div>
                <div className="font-bold text-yellow-300">{entry.exactMatches}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-purple-500">Score</div>
                <div className={cn(
                  'text-xl font-extrabold',
                  idx === 0 ? 'text-yellow-300' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-white'
                )}>
                  {entry.totalScore}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-purple-600">—</div>
          )}
        </div>
      ))}
    </div>
  )
}
