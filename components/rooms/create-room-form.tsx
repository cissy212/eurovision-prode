'use client'

import { createRoom } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActionState } from 'react'

type State = { error?: string } | null

export function CreateRoomForm({ onClose }: { onClose?: () => void }) {
  const [state, action, pending] = useActionState<State, FormData>(
    async (_, formData) => {
      return await createRoom(formData)
    },
    null
  )

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-bold text-white text-lg">Create a new room</h3>
        <p className="text-purple-400 text-sm">Give your group a fun name!</p>
      </div>
      <Input
        id="name"
        name="name"
        label="Room name"
        placeholder="e.g. Living Room Legends 🎶"
        required
        minLength={2}
        maxLength={60}
        error={state?.error}
      />
      <div className="flex gap-3">
        <Button type="submit" loading={pending} className="flex-1">
          Create room 🎉
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
