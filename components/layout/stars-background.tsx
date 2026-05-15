'use client'

import { useEffect, useRef } from 'react'

export function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      offset: Math.random() * Math.PI * 2,
    }))

    // Create sparkles
    const sparkles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.01,
      offset: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      // Stars
      for (const star of stars) {
        const alpha = 0.3 + 0.5 * Math.sin(t * star.speed * 60 + star.offset)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      // Sparkles (4-pointed stars)
      for (const sp of sparkles) {
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(t * sp.speed * 30 + sp.offset))
        const size = sp.size * (0.7 + 0.3 * Math.sin(t * sp.speed * 20 + sp.offset))
        ctx.save()
        ctx.translate(sp.x, sp.y)
        ctx.rotate(t * 0.3)
        ctx.strokeStyle = `rgba(255, 200, 255, ${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(0, size)
        ctx.moveTo(-size, 0)
        ctx.lineTo(size, 0)
        ctx.stroke()
        ctx.restore()
      }

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
