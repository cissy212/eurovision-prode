'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-2xl font-bold tracking-widest text-yellow-300 glow-gold px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
        {code}
      </span>
      <Button onClick={copy} variant="secondary" size="sm">
        {copied ? '✓ Copied!' : 'Copy'}
      </Button>
    </div>
  )
}
