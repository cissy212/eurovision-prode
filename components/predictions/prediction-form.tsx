'use client'

import { useState, useTransition } from 'react'
import type { Contestant } from '@/lib/supabase/types'
import { savePredictions, saveFavourites } from '@/app/actions/predictions'
import { RankingBoard } from '@/components/predictions/ranking-board'
import { ContestantCard } from '@/components/contestants/contestant-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PredictionFormProps {
  contestants: Contestant[]
  roomId: string
  initialPredictions: { rank: number; contestant_id: string }[]
  initialFavourites: string[]
  locked: boolean
}

export function PredictionForm({
  contestants,
  roomId,
  initialPredictions,
  initialFavourites,
  locked,
}: PredictionFormProps) {
  // Sort initial predictions by rank
  const sortedInitial = [...initialPredictions].sort((a, b) => a.rank - b.rank)
  const initialRanked = sortedInitial
    .map((p) => contestants.find((c) => c.id === p.contestant_id))
    .filter(Boolean) as Contestant[]

  const [ranked, setRanked] = useState<Contestant[]>(initialRanked)
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set(initialFavourites))
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'predict' | 'favourites'>('predict')

  const unranked = contestants.filter((c) => !ranked.find((r) => r.id === c.id))

  const addToRanked = (contestant: Contestant) => {
    if (ranked.length >= 10) return
    setRanked((prev) => [...prev, contestant])
  }

  const removeFromRanked = (id: string) => {
    setRanked((prev) => prev.filter((c) => c.id !== id))
  }

  const toggleFavourite = (id: string) => {
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    if (ranked.length !== 10) {
      setMessage({ type: 'error', text: 'You must select exactly 10 contestants for your ranking.' })
      return
    }

    startTransition(async () => {
      const predictResult = await savePredictions(
        roomId,
        ranked.map((c, i) => ({ rank: i + 1, contestant_id: c.id }))
      )

      if (predictResult?.error) {
        setMessage({ type: 'error', text: predictResult.error })
        return
      }

      const favResult = await saveFavourites(roomId, Array.from(favouriteIds))
      if (favResult?.error) {
        setMessage({ type: 'error', text: favResult.error })
        return
      }

      setMessage({ type: 'success', text: 'Predictions saved! Good luck!' })
    })
  }

  if (locked) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold text-white">Predictions are locked</h2>
        <p className="text-purple-400 text-sm">The competition has started. No more changes allowed.</p>
        {ranked.length > 0 && (
          <div className="mt-6 space-y-2 text-left">
            <p className="text-sm text-purple-300 font-medium">Your predictions:</p>
            {ranked.map((c, i) => (
              <ContestantCard key={c.id} contestant={c} rank={i + 1} compact favourite={favouriteIds.has(c.id)} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-purple-700/40 pb-1">
        <button
          onClick={() => setActiveTab('predict')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === 'predict'
              ? 'text-pink-300 border-b-2 border-pink-400'
              : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          🎯 Top 10 Ranking
          {ranked.length > 0 && (
            <Badge className="ml-2" variant={ranked.length === 10 ? 'success' : 'warning'}>
              {ranked.length}/10
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('favourites')}
          className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            activeTab === 'favourites'
              ? 'text-pink-300 border-b-2 border-pink-400'
              : 'text-purple-400 hover:text-purple-200'
          }`}
        >
          ❤️ My Favourites
          {favouriteIds.size > 0 && (
            <Badge className="ml-2" variant="default">
              {favouriteIds.size}
            </Badge>
          )}
        </button>
      </div>

      {activeTab === 'predict' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: ranked list */}
          <div className="space-y-3">
            <h2 className="font-bold text-purple-200 text-sm uppercase tracking-wider">
              Your Top 10 {ranked.length === 10 && '✓'}
            </h2>
            <RankingBoard
              ranked={ranked}
              favouriteIds={favouriteIds}
              onReorder={setRanked}
              onRemove={removeFromRanked}
            />
          </div>

          {/* Right: contestant picker */}
          <div className="space-y-3">
            <h2 className="font-bold text-purple-200 text-sm uppercase tracking-wider">
              All contestants ({unranked.length} remaining)
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {unranked.map((c) => (
                <ContestantCard
                  key={c.id}
                  contestant={c}
                  onClick={ranked.length < 10 ? () => addToRanked(c) : undefined}
                  favourite={favouriteIds.has(c.id)}
                  className={ranked.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}
                />
              ))}
              {unranked.length === 0 && (
                <div className="text-center text-purple-500 text-sm py-4">
                  All contestants ranked! ✓
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favourites' && (
        <div className="space-y-3">
          <p className="text-sm text-purple-400">
            Heart your personal favourites — these don&apos;t affect your score, but will appear on your profile and recap.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {contestants.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleFavourite(c.id)}
                className="cursor-pointer"
              >
                <ContestantCard
                  contestant={c}
                  selected={favouriteIds.has(c.id)}
                  favourite={favouriteIds.has(c.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button + feedback */}
      <div className="sticky bottom-4 flex flex-col gap-3">
        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}
        <Button
          onClick={handleSave}
          loading={isPending}
          disabled={ranked.length !== 10}
          size="lg"
          className="w-full glow-pink shadow-2xl"
        >
          {ranked.length === 10
            ? '💾 Save predictions'
            : `Select ${10 - ranked.length} more contestant${10 - ranked.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
