'use client'

import { signIn } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'

type State = { error?: string } | null

export function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => {
      return await signIn(formData)
    },
    null
  )

  return (
    <form action={action} className="glass-card rounded-2xl p-8 space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Join the game</h2>
        <p className="text-purple-400 text-sm">Enter your name to start predicting</p>
      </div>

      <Input
        id="display_name"
        name="display_name"
        type="text"
        label="Your name"
        placeholder="e.g. Conchita Fan"
        required
        minLength={2}
        maxLength={30}
        autoFocus
        autoComplete="off"
        error={state?.error}
      />

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Let&apos;s go ✨
      </Button>

      <p className="text-center text-xs text-purple-500">
        If your name is already taken, you&apos;ll be logged in as that person.
      </p>
    </form>
  )
}
