'use client'

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
import type { Contestant } from '@/lib/supabase/types'
import { ContestantCard } from '@/components/contestants/contestant-card'
import { cn } from '@/lib/utils'

interface SortableItemProps {
  contestant: Contestant
  rank: number
  isFavourite: boolean
  onRemove: () => void
}

function SortableItem({ contestant, rank, isFavourite, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contestant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-2 group', isDragging && 'opacity-50')}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-purple-600 hover:text-purple-300 transition-colors p-1 touch-none"
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      <div className="flex-1">
        <ContestantCard
          contestant={contestant}
          rank={rank}
          favourite={isFavourite}
          dragging={isDragging}
        />
      </div>

      <button
        onClick={onRemove}
        className="text-purple-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Remove ${contestant.artist}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

interface RankingBoardProps {
  ranked: Contestant[]
  favouriteIds: Set<string>
  onReorder: (items: Contestant[]) => void
  onRemove: (id: string) => void
}

export function RankingBoard({ ranked, favouriteIds, onReorder, onRemove }: RankingBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = ranked.findIndex((c) => c.id === active.id)
      const newIndex = ranked.findIndex((c) => c.id === over.id)
      onReorder(arrayMove(ranked, oldIndex, newIndex))
    }
  }

  if (ranked.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-purple-700/50 p-8 text-center text-purple-500 text-sm">
        <div className="text-3xl mb-2">👆</div>
        Click contestants from the list to add them to your Top 10
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ranked.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {ranked.map((contestant, index) => (
            <SortableItem
              key={contestant.id}
              contestant={contestant}
              rank={index + 1}
              isFavourite={favouriteIds.has(contestant.id)}
              onRemove={() => onRemove(contestant.id)}
            />
          ))}
          {ranked.length < 10 && (
            <div className="rounded-xl border border-dashed border-purple-700/40 p-3 text-center text-xs text-purple-600">
              {10 - ranked.length} more needed — click contestants below to add
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
