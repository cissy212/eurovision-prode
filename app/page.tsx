import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex flex-col items-center justify-center min-h-[85dvh] px-4 py-16 text-center">
      {/* Hero */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-7xl mb-4 animate-bounce">🎤</div>

        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          <span className="text-gradient-euro">Eurovision</span>
          <br />
          <span className="text-white">Prode 2026</span>
        </h1>

        <p className="text-lg text-purple-300 max-w-md mx-auto leading-relaxed">
          Predict the Eurovision 2026 Grand Final Top 10, pick your personal favourites,
          and see who among your friends gets it right.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/login">
            <Button size="lg" className="glow-pink w-full sm:w-auto">
              Start predicting ✨
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
        {[
          { emoji: '🏆', title: 'Predict the Top 10', desc: 'Drag and rank your predicted winners before the show starts' },
          { emoji: '❤️', title: 'Pick your favourites', desc: 'Choose who you love — separate from your competition picks' },
          { emoji: '📊', title: 'Compete with friends', desc: 'Create a room, share the code, and see who knows Eurovision best' },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl p-6 text-left space-y-2">
            <div className="text-3xl">{emoji}</div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-purple-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Scoring info */}
      <div className="mt-10 glass-card rounded-2xl p-6 max-w-sm w-full text-left">
        <h3 className="font-bold text-purple-200 mb-3 text-sm uppercase tracking-wider">Scoring</h3>
        <ul className="space-y-2 text-sm text-purple-300">
          <li className="flex items-center gap-2">
            <span className="text-green-400 font-bold">+1</span> Contestant in your top 10 makes the real top 10
          </li>
          <li className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">+2</span> Bonus for exact rank match
          </li>
          <li className="flex items-center gap-2">
            <span className="text-pink-400 font-bold">30</span> Maximum possible score
          </li>
        </ul>
      </div>
    </div>
  )
}
