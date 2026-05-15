import { createServiceClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ResultsForm } from '@/components/predictions/results-form'

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return { title: `Results — Room ${code} — Eurovision Prode 2026` }
}

export default async function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()

  const { data: room } = await service
    .from('rooms').select('*').eq('invite_code', code.toUpperCase()).single()

  if (!room) notFound()
  if (room.admin_user_id !== user.id) redirect(`/rooms/${code}`)

  const { data: contestants } = await service
    .from('contestants').select('*').order('running_order', { ascending: true })

  const { data: existingResults } = await service
    .from('results').select('rank, contestant_id').eq('room_id', room.id).order('rank', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <Link href={`/rooms/${code}`} className="text-purple-400 hover:text-purple-200 text-sm">← {room.name}</Link>
        <h1 className="text-3xl font-extrabold text-white mt-2">Enter Official Results 📝</h1>
        <p className="text-purple-400 text-sm mt-1">Admin only. Enter the official Eurovision Top 10 to trigger score calculation.</p>
      </div>
      <ResultsForm contestants={contestants ?? []} roomId={room.id} inviteCode={code} initialResults={existingResults ?? []} />
    </div>
  )
}
