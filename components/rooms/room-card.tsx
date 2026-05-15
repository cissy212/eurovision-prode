import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Room } from '@/lib/supabase/types'

interface RoomCardProps {
  room: Room
  memberCount: number
  isAdmin: boolean
  hasPredictions: boolean
}

export function RoomCard({ room, memberCount, isAdmin, hasPredictions }: RoomCardProps) {
  return (
    <Link href={`/rooms/${room.invite_code}`} className="block group">
      <div className="glass-card rounded-2xl p-5 space-y-3 hover:border-purple-400/50 transition-all hover:glow-purple group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
            {room.name}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            {isAdmin && <Badge variant="gold">Admin</Badge>}
            {room.locked && <Badge variant="danger">Locked</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-purple-400">
          <span className="flex items-center gap-1">
            👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className="font-mono text-purple-500 tracking-widest text-xs">
            {room.invite_code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasPredictions ? (
            <Badge variant="success">✓ Predictions saved</Badge>
          ) : room.locked ? (
            <Badge variant="danger">⏰ Locked — no predictions</Badge>
          ) : (
            <Badge variant="warning">⚠ Predictions pending</Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
