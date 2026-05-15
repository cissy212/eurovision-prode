'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Contestant } from '@/lib/supabase/types'
import { publishResults } from '@/app/actions/results'
import { Button } from '@/components/ui/button'
import { ContestantCard } from '@/components/contestants/contestant-card'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

function SortableResultItem({
  contestant,
  rank,
  onRemove,
}: {
  contestant: Contestant
  rank: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: contestant.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-2 group', isDragging && 'opacity-50')}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-purple-600 hover:text-purple-300 p-1 touch-none"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" /><circle cx="5" cy="8" r="1.5" /><circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="4" r="1.5" /><circle cx="11" cy="8" r="1.5" /><circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>
      <div className="flex-1">
        <ContestantCard contestant={contestant} rank={rank} />
      </div>
      <button onClick={onRemove} className="text-purple-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface ResultsFormProps {
  contestants: Contestant[]
  roomId: string
  inviteCode: string
  initialResults: { rank: number; contestant_id: string }[]
}

export function ResultsForm({ contestants, roomId, inviteCode, initialResults }: ResultsFormProps) {
  const router = useRouter()
  const sortedInitial = [...initialResults].sort((a, b) => a.rank - b.rank)
  const initialRanked = sortedInitial
    .map((r) => contestants.find((c) => c.id === r.contestant_id))
    .filter(Boolean) as Contestant[]

  const [ranked, setRanked] = useState<Contestant[]>(initialRanked)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = ranked.findIndex((c) => c.id === active.id)
      const newIndex = ranked.findIndex((c) => c.id === over.id)
      setRanked(arrayMove(ranked, oldIndex, newIndex))
    }
  }

  const unranked = contestants.filter((c) => !ranked.find((r) => r.id === c.id))

  const handlePublish = () => {
    if (ranked.length !== 10) {
      setMessage({ type: 'error', text: 'Enter exactly 10 results.' })
      return
    }
    startTransition(async () => {
      const result = await publishResults(
        roomId,
        ranked.map((c, i) => ({ rank: i + 1, contestant_id: c.id }))
      )
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Results published! Scores calculated.' })
        setTimeout(() => router.push(`/rooms/${inviteCode}/leaderboard`), 1500)
      }
    })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Official results ranking */}
      <div className="space-y-3">
        <h2 className="font-bold text-purple-200 text-sm uppercase tracking-wider">
          Official Top 10 ({ranked.length}/10)
        </h2>

        {ranked.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-purple-700/50 p-8 text-center text-purple-500 text-sm">
            Click contestants to add them
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ranked.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {ranked.map((c, i) => (
                  <SortableResultItem
                    key={c.id}
                    contestant={c}
                    rank={i + 1}
                    onRemove={() => setRanked((prev) => prev.filter((r) => r.id !== c.id))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        )}

        <Button
          onClick={handlePublish}
          loading={isPending}
          disabled={ranked.length !== 10}
          className="w-full glow-pink"
          size="lg"
        >
          🏆 Publish results & calculate scores
        </Button>
      </div>

      {/* Contestant picker */}
      <div className="space-y-3">
        <h2 className="font-bold text-purple-200 text-sm uppercase tracking-wider">
          All contestants ({unranked.length} remaining)
        </h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {unranked.map((c) => (
            <ContestantCard
              key={c.id}
              contestant={c}
              onClick={ranked.length < 10 ? () => setRanked((prev) => [...prev, c]) : undefined}
              className={ranked.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
