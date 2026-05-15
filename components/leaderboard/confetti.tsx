'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#e0358b', '#7c5cbf', '#f5c842', '#4d9ef5', '#f04da0', '#ffffff']

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      vr: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }))

    let animId: number
    let elapsed = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      elapsed += 16

      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vr
        if (elapsed > 3000) p.opacity = Math.max(0, p.opacity - 0.005)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      const stillVisible = pieces.some((p) => p.y < canvas.height && p.opacity > 0)
      if (stillVisible) animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  )
}
