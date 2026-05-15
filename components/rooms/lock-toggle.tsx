'use client'

import { lockRoom, unlockRoom } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'

export function LockToggle({ roomId, locked }: { roomId: string; locked: boolean }) {
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    startTransition(async () => {
      if (locked) {
        await unlockRoom(roomId)
      } else {
        await lockRoom(roomId)
      }
    })
  }

  return (
    <Button
      onClick={toggle}
      loading={pending}
      variant={locked ? 'secondary' : 'danger'}
      size="sm"
    >
      {locked ? '🔓 Unlock predictions' : '🔒 Lock predictions'}
    </Button>
  )
}
