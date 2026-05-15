import { cn } from '@/lib/utils'
import type { Contestant } from '@/lib/supabase/types'

interface ContestantCardProps {
  contestant: Contestant
  rank?: number
  compact?: boolean
  selected?: boolean
  favourite?: boolean
  onClick?: () => void
  className?: string
  dragging?: boolean
}

export function ContestantCard({
  contestant,
  rank,
  compact,
  selected,
  favourite,
  onClick,
  className,
  dragging,
}: ContestantCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border transition-all',
        compact ? 'p-2.5' : 'p-3.5',
        selected
          ? 'border-pink-400/60 bg-pink-500/10'
          : 'border-purple-500/30 bg-purple-900/30 hover:border-purple-400/50 hover:bg-purple-800/40',
        dragging && 'opacity-50 scale-95',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {rank !== undefined && (
        <div className="rank-badge flex-shrink-0 text-sm">
          {rank}
        </div>
      )}

      <span className="text-2xl flex-shrink-0" role="img" aria-label={contestant.country}>
        {contestant.flag_emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-white text-sm truncate">{contestant.artist}</div>
        <div className="text-xs text-purple-400 truncate">{contestant.song}</div>
        {!compact && (
          <div className="text-xs text-purple-500 mt-0.5">{contestant.country}</div>
        )}
      </div>

      {favourite && (
        <span className="text-lg flex-shrink-0" title="Your favourite">❤️</span>
      )}
    </div>
  )
}
