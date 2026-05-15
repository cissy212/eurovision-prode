'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateRoomForm } from '@/components/rooms/create-room-form'
import { JoinRoomForm } from '@/components/rooms/join-room-form'

type Modal = 'create' | 'join' | null

export function DashboardActions() {
  const [modal, setModal] = useState<Modal>(null)

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button onClick={() => setModal('create')} className="flex-1 sm:flex-none">
          + Create room
        </Button>
        <Button onClick={() => setModal('join')} variant="secondary" className="flex-1 sm:flex-none">
          Join with code
        </Button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border-glow-animated">
            {modal === 'create' && <CreateRoomForm onClose={() => setModal(null)} />}
            {modal === 'join' && <JoinRoomForm onClose={() => setModal(null)} />}
          </div>
        </div>
      )}
    </div>
  )
}
