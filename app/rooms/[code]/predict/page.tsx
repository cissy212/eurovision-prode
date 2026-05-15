import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PredictionForm } from '@/components/predictions/prediction-form'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return { title: `Predict — Room ${code} — Eurovision Prode 2026` }
}

export default async function PredictPage({ params }: { params: Promise<{ code: string }> }) {
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

  const { data: contestants } = await service
    .from('contestants').select('*').order('running_order', { ascending: true })

  const { data: predictions } = await service
    .from('predictions').select('rank, contestant_id').eq('user_id', user.id).eq('room_id', room.id)

  const { data: favourites } = await service
    .from('favourites').select('contestant_id').eq('user_id', user.id).eq('room_id', room.id)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div>
        <Link href={`/rooms/${code}`} className="text-purple-400 hover:text-purple-200 text-sm transition-colors">
          ← {room.name}
        </Link>
        <h1 className="text-3xl font-extrabold text-white mt-2">Your Predictions 🎯</h1>
        <p className="text-purple-400 text-sm mt-1">Rank your Top 10 Eurovision 2026 finalists. Drag to reorder.</p>
      </div>

      <PredictionForm
        contestants={contestants ?? []}
        roomId={room.id}
        initialPredictions={predictions ?? []}
        initialFavourites={(favourites ?? []).map((f) => f.contestant_id)}
        locked={room.locked}
      />
    </div>
  )
}
