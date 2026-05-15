'use client'

import { signInWithEmail } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'

type State = { error?: string; success?: boolean } | null

export function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => {
      return await signInWithEmail(formData)
    },
    null
  )

  if (state?.success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="text-5xl">📬</div>
        <h2 className="text-xl font-bold text-white">Check your inbox!</h2>
        <p className="text-purple-300 text-sm leading-relaxed">
          We sent you a magic link. Click it to sign in — no password needed.
        </p>
        <p className="text-purple-500 text-xs">The link expires in 1 hour.</p>
      </div>
    )
  }

  return (
    <form action={action} className="glass-card rounded-2xl p-8 space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Sign in</h2>
        <p className="text-purple-400 text-sm">Enter your email to receive a magic link</p>
      </div>

      <Input
        id="display_name"
        name="display_name"
        type="text"
        label="Your name (shown on leaderboard)"
        placeholder="e.g. Conchita Fan 🌹"
        required
        minLength={2}
        maxLength={30}
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        required
        error={state?.error}
      />

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Send magic link ✨
      </Button>

      <p className="text-center text-xs text-purple-500">
        No account needed — just enter your email and go!
      </p>
    </form>
  )
}
