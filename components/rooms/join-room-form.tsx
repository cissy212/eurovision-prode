'use client'

import { joinRoom } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'

type State = { error?: string } | null

export function JoinRoomForm({ onClose }: { onClose?: () => void }) {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => {
      return await joinRoom(formData)
    },
    null
  )

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-bold text-white text-lg">Join a room</h3>
        <p className="text-purple-400 text-sm">Enter the invite code from your friend</p>
      </div>
      <Input
        id="invite_code"
        name="invite_code"
        label="Invite code"
        placeholder="e.g. ABC123"
        required
        maxLength={6}
        className="uppercase tracking-widest text-lg font-mono"
        error={state?.error}
      />
      <div className="flex gap-3">
        <Button type="submit" loading={pending} variant="secondary" className="flex-1">
          Join room 🚀
        </Button>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
