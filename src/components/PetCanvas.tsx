'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { PetStage, PetMood, PetType } from '@/lib/types'

interface PetCanvasProps {
  stage: PetStage
  mood: PetMood
  petType: PetType
  ageSeconds: number
}

const PET_COLORS: Record<PetType, { body: string; outline: string; accent: string }> = {
  angel: { body: '#88aaff', outline: '#00ffff', accent: '#ffffff' },
  normal: { body: '#ffaa44', outline: '#ffcc00', accent: '#ff6600' },
  mischief: { body: '#cc44ff', outline: '#ff00ff', accent: '#8800cc' },
  sickly: { body: '#88bb66', outline: '#00ff88', accent: '#446633' },
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

export default function PetCanvas({ stage, mood, petType, ageSeconds }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(performance.now())

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
      ctx.clearRect(0, 0, width, height)

      const colors = PET_COLORS[petType]
      const cx = width / 2
      const cy = height / 2

      const isDead = mood === 'dead'
      const isSleeping = mood === 'sleeping'
      const isEating = mood === 'eating'
      const isPlaying = mood === 'playing'
      const isHappy = mood === 'happy'

      // Bounce / float offset
      let offsetY = 0
      if (!isDead && !isSleeping) {
        if (isPlaying) {
          offsetY = Math.sin(t * 8) * 6
        } else if (isEating) {
          offsetY = Math.sin(t * 6) * 4
        } else {
          offsetY = Math.sin(t * 1.5) * 5
        }
      } else if (isSleeping) {
        offsetY = Math.sin(t * 0.8) * 3
      }

      // Body color (grey if dead)
      const bodyColor = isDead ? '#555577' : colors.body
      const outlineColor = isDead ? '#334455' : colors.outline
      const [r, g, b] = hexToRgb(outlineColor)

      // Draw sparkles/background decorations
      if (!isDead) {
        drawSparkles(ctx, cx, cy, t, isHappy || isPlaying)
      }

      // Set glow
      ctx.shadowColor = outlineColor
      ctx.shadowBlur = isDead ? 0 : 18

      // Draw based on stage
      switch (stage) {
        case 'egg':
          drawEgg(ctx, cx, cy + offsetY, bodyColor, outlineColor, t, ageSeconds, r, g, b)
          break
        case 'baby':
          drawBaby(ctx, cx, cy + offsetY, bodyColor, outlineColor, t)
          break
        case 'child':
          drawChild(ctx, cx, cy + offsetY, bodyColor, outlineColor, t)
          break
        case 'teen':
          drawTeen(ctx, cx, cy + offsetY, bodyColor, outlineColor, petType, t)
          break
        case 'adult':
          drawAdult(ctx, cx, cy + offsetY, bodyColor, outlineColor, petType, t)
          break
      }

      ctx.shadowBlur = 0

      // Draw mood overlay (face)
      if (stage !== 'egg') {
        const faceY = stage === 'baby' ? cy + offsetY - 5
          : stage === 'child' ? cy + offsetY - 15
          : stage === 'teen' ? cy + offsetY - 18
          : cy + offsetY - 22

        drawFace(ctx, cx, faceY, mood, stage)
      }

      // Sleeping ZZZ
      if (isSleeping && stage !== 'egg') {
        drawZZZ(ctx, cx + 40, cy + offsetY - 40, t)
      }

      // Sickly sweat drops
      if (mood === 'sick' && stage !== 'egg') {
        drawSweatDrops(ctx, cx, cy + offsetY, t)
      }

      // Playing stars
      if (isPlaying) {
        drawPlayStars(ctx, cx, cy + offsetY, t)
      }
    },
    [stage, mood, petType, ageSeconds]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const size = 240
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const t = (now - startTimeRef.current) / 1000
      draw(ctx, size, size, t)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="mx-auto block"
      aria-label={`Virtual pet in ${stage} stage, feeling ${mood}`}
    />
  )
}

// ─── Drawing helpers ───────────────────────────────────────────────────────────

function drawSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, extra: boolean) {
  const count = extra ? 8 : 5
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.5
    const dist = 90 + Math.sin(t * 1.2 + i) * 15
    const sx = cx + Math.cos(angle) * dist
    const sy = cy + Math.sin(angle) * dist * 0.6
    const alpha = 0.2 + 0.6 * ((Math.sin(t * 2 + i * 1.3) + 1) / 2)
    const size = 2 + Math.sin(t * 1.5 + i) * 1

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = i % 2 === 0 ? '#00ffff' : '#ff00ff'
    ctx.shadowColor = i % 2 === 0 ? '#00ffff' : '#ff00ff'
    ctx.shadowBlur = 6

    // 4-pointed star
    ctx.beginPath()
    for (let p = 0; p < 4; p++) {
      const a = (p / 4) * Math.PI * 2
      const a2 = ((p + 0.5) / 4) * Math.PI * 2
      if (p === 0) ctx.moveTo(sx + Math.cos(a) * size, sy + Math.sin(a) * size)
      else ctx.lineTo(sx + Math.cos(a) * size, sy + Math.sin(a) * size)
      ctx.lineTo(sx + Math.cos(a2) * size * 0.4, sy + Math.sin(a2) * size * 0.4)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

function drawEgg(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyColor: string,
  outlineColor: string,
  t: number,
  ageSeconds: number,
  r: number,
  g: number,
  b: number
) {
  const wobble = Math.sin(t * 2.5) * 4
  const rx = 58
  const ry = 75

  // Egg shadow
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, cy + ry + 5, rx * 0.7, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Egg body gradient
  const grad = ctx.createRadialGradient(cx - 15, cy - 20, 10, cx, cy, rx)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.4, bodyColor)
  grad.addColorStop(1, `rgba(${r},${g},${b},0.6)`)

  ctx.save()
  ctx.translate(cx + wobble * 0.5, cy)
  ctx.rotate((wobble * Math.PI) / 180)
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Spots / texture
  ctx.globalAlpha = 0.3
  ctx.fillStyle = outlineColor
  const spots = [
    { x: -15, y: -30, r: 5 },
    { x: 20, y: -10, r: 4 },
    { x: -5, y: 20, r: 6 },
    { x: 25, y: 30, r: 3 },
  ]
  spots.forEach((s) => {
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.restore()

  // Crack lines (after 60s)
  if (ageSeconds > 60) {
    const alpha = Math.min(1, (ageSeconds - 60) / 60)
    ctx.save()
    ctx.globalAlpha = alpha * 0.8
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(cx - 5, cy - 30)
    ctx.lineTo(cx + 8, cy - 15)
    ctx.lineTo(cx + 2, cy - 5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx + 20, cy - 5)
    ctx.lineTo(cx + 12, cy + 10)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(cx - 20, cy + 10)
    ctx.lineTo(cx - 10, cy + 25)
    ctx.lineTo(cx - 18, cy + 35)
    ctx.stroke()

    ctx.restore()
  }

  // Shine
  ctx.save()
  ctx.globalAlpha = 0.25
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx - 18, cy - 25, 12, 20, -Math.PI / 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBaby(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyColor: string,
  outlineColor: string,
  t: number
) {
  const r = 55
  const squeeze = 1 + Math.sin(t * 3) * 0.03

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, cy + r + 8, r * 0.7, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body circle
  const grad = ctx.createRadialGradient(cx - 15, cy - 20, 5, cx, cy, r)
  grad.addColorStop(0, lightenColor(bodyColor, 40))
  grad.addColorStop(1, darkenColor(bodyColor, 20))

  ctx.save()
  ctx.scale(1 / squeeze, squeeze)
  ctx.beginPath()
  ctx.arc(cx * squeeze, cy / squeeze, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()

  // Nub feet
  ctx.fillStyle = darkenColor(bodyColor, 15)
  ctx.beginPath()
  ctx.ellipse(cx - 22, cy + r - 5, 13, 9, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 22, cy + r - 5, 13, 9, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Antenna
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy - r + 5)
  ctx.quadraticCurveTo(cx + 10, cy - r - 15, cx + 5, cy - r - 30)
  ctx.stroke()
  ctx.fillStyle = outlineColor
  ctx.beginPath()
  ctx.arc(cx + 5, cy - r - 30, 5, 0, Math.PI * 2)
  ctx.fill()

  // Shine
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx - 18, cy - 22, 14, 20, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawChild(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyColor: string,
  outlineColor: string,
  t: number
) {
  const headR = 50
  const bodyRx = 40
  const bodyRy = 48
  const breathe = Math.sin(t * 2) * 0.015

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, cy + bodyRy + headR * 0.1 + 8, bodyRx * 0.8, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body
  const bodyGrad = ctx.createRadialGradient(cx - 10, cy + 10, 5, cx, cy + 20, bodyRx + bodyRy)
  bodyGrad.addColorStop(0, lightenColor(bodyColor, 20))
  bodyGrad.addColorStop(1, darkenColor(bodyColor, 25))

  ctx.save()
  ctx.scale(1 + breathe, 1 - breathe * 0.5)
  ctx.beginPath()
  ctx.ellipse(cx / (1 + breathe), (cy + headR * 0.8) / (1 - breathe * 0.5), bodyRx, bodyRy, 0, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // Stub arms
  ctx.fillStyle = darkenColor(bodyColor, 10)
  ctx.beginPath()
  ctx.ellipse(cx - bodyRx - 5, cy + headR * 0.9, 12, 8, -0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + bodyRx + 5, cy + headR * 0.9, 12, 8, 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Feet
  ctx.fillStyle = darkenColor(bodyColor, 20)
  ctx.beginPath()
  ctx.ellipse(cx - 18, cy + headR * 0.8 + bodyRy - 5, 14, 9, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 18, cy + headR * 0.8 + bodyRy - 5, 14, 9, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Head
  const headGrad = ctx.createRadialGradient(cx - 12, cy - headR * 0.3, 5, cx, cy - headR * 0.1, headR)
  headGrad.addColorStop(0, lightenColor(bodyColor, 50))
  headGrad.addColorStop(1, bodyColor)

  ctx.beginPath()
  ctx.arc(cx, cy - headR * 0.1, headR, 0, Math.PI * 2)
  ctx.fillStyle = headGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Cheeks
  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#ff88aa'
  ctx.beginPath()
  ctx.ellipse(cx - 28, cy + 8, 10, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 28, cy + 8, 10, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Shine
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx - 16, cy - headR * 0.5, 13, 18, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTeen(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyColor: string,
  outlineColor: string,
  petType: PetType,
  t: number
) {
  const headR = 45
  const bodyY = cy + headR * 0.7

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, bodyY + 65, 38, 8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body (bezier shape)
  ctx.beginPath()
  ctx.moveTo(cx - 35, bodyY + 10)
  ctx.bezierCurveTo(cx - 45, bodyY + 30, cx - 40, bodyY + 70, cx - 20, bodyY + 75)
  ctx.lineTo(cx + 20, bodyY + 75)
  ctx.bezierCurveTo(cx + 40, bodyY + 70, cx + 45, bodyY + 30, cx + 35, bodyY + 10)
  ctx.bezierCurveTo(cx + 30, bodyY - 5, cx - 30, bodyY - 5, cx - 35, bodyY + 10)
  ctx.closePath()

  const bodyGrad = ctx.createLinearGradient(cx - 45, bodyY, cx + 45, bodyY + 75)
  bodyGrad.addColorStop(0, lightenColor(bodyColor, 15))
  bodyGrad.addColorStop(1, darkenColor(bodyColor, 30))
  ctx.fillStyle = bodyGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Arms (curved)
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  const armSwing = Math.sin(t * 2) * 5

  ctx.beginPath()
  ctx.moveTo(cx - 35, bodyY + 20)
  ctx.quadraticCurveTo(cx - 65, bodyY + 35 + armSwing, cx - 60, bodyY + 55)
  ctx.stroke()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 35, bodyY + 20)
  ctx.quadraticCurveTo(cx - 65, bodyY + 35 + armSwing, cx - 60, bodyY + 55)
  ctx.stroke()

  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(cx + 35, bodyY + 20)
  ctx.quadraticCurveTo(cx + 65, bodyY + 35 - armSwing, cx + 60, bodyY + 55)
  ctx.stroke()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx + 35, bodyY + 20)
  ctx.quadraticCurveTo(cx + 65, bodyY + 35 - armSwing, cx + 60, bodyY + 55)
  ctx.stroke()

  // Legs
  ctx.fillStyle = darkenColor(bodyColor, 25)
  ctx.beginPath()
  ctx.ellipse(cx - 16, bodyY + 82, 13, 10, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 16, bodyY + 82, 13, 10, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Head
  const headGrad = ctx.createRadialGradient(cx - 12, cy - headR * 0.3, 5, cx, cy, headR)
  headGrad.addColorStop(0, lightenColor(bodyColor, 45))
  headGrad.addColorStop(1, bodyColor)

  ctx.beginPath()
  ctx.arc(cx, cy, headR, 0, Math.PI * 2)
  ctx.fillStyle = headGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Hair / horn based on type
  if (petType === 'mischief') {
    // Devil horns
    ctx.fillStyle = '#cc0000'
    ctx.beginPath()
    ctx.moveTo(cx - 20, cy - headR + 5)
    ctx.lineTo(cx - 28, cy - headR - 18)
    ctx.lineTo(cx - 10, cy - headR - 2)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx + 20, cy - headR + 5)
    ctx.lineTo(cx + 28, cy - headR - 18)
    ctx.lineTo(cx + 10, cy - headR - 2)
    ctx.closePath()
    ctx.fill()
  } else if (petType === 'angel') {
    // Halo
    ctx.strokeStyle = '#ffdd44'
    ctx.lineWidth = 3
    ctx.shadowColor = '#ffdd44'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.ellipse(cx, cy - headR - 8, 22, 6, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
  } else {
    // Spiky hair
    ctx.fillStyle = darkenColor(bodyColor, 30)
    for (let i = 0; i < 4; i++) {
      const hx = cx - 25 + i * 16
      ctx.beginPath()
      ctx.moveTo(hx - 6, cy - headR + 5)
      ctx.lineTo(hx, cy - headR - 12 - i * 2)
      ctx.lineTo(hx + 6, cy - headR + 5)
      ctx.closePath()
      ctx.fill()
    }
  }
}

function drawAdult(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  bodyColor: string,
  outlineColor: string,
  petType: PetType,
  t: number
) {
  const headR = 42
  const bodyY = cy + headR * 0.75
  const breathe = Math.sin(t * 1.5) * 0.02

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, bodyY + 78, 45, 9, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Body
  ctx.save()
  ctx.scale(1 + breathe, 1 - breathe * 0.5)
  ctx.beginPath()
  ctx.moveTo(cx / (1 + breathe) - 40, (bodyY + 15) / (1 - breathe * 0.5))
  const bx = cx / (1 + breathe)
  const by0 = bodyY / (1 - breathe * 0.5)
  ctx.bezierCurveTo(bx - 55, by0 + 35, bx - 50, by0 + 80, bx - 25, by0 + 85)
  ctx.lineTo(bx + 25, by0 + 85)
  ctx.bezierCurveTo(bx + 50, by0 + 80, bx + 55, by0 + 35, bx + 40, by0 + 15)
  ctx.bezierCurveTo(bx + 35, by0 - 5, bx - 35, by0 - 5, bx - 40, by0 + 15)
  ctx.closePath()

  const bodyGrad = ctx.createLinearGradient(cx - 55, bodyY, cx + 55, bodyY + 85)
  bodyGrad.addColorStop(0, lightenColor(bodyColor, 20))
  bodyGrad.addColorStop(0.5, bodyColor)
  bodyGrad.addColorStop(1, darkenColor(bodyColor, 35))
  ctx.fillStyle = bodyGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()

  // Arms
  const armSwing = Math.sin(t * 1.8) * 6
  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 16
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(cx - 40, bodyY + 20)
  ctx.quadraticCurveTo(cx - 70, bodyY + 40 + armSwing, cx - 68, bodyY + 62)
  ctx.stroke()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 16
  ctx.beginPath()
  ctx.moveTo(cx + 40, bodyY + 20)
  ctx.quadraticCurveTo(cx + 70, bodyY + 40 - armSwing, cx + 68, bodyY + 62)
  ctx.stroke()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Hands
  ctx.fillStyle = lightenColor(bodyColor, 15)
  ctx.beginPath()
  ctx.arc(cx - 68, bodyY + 64, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + 68, bodyY + 64, 10, 0, Math.PI * 2)
  ctx.fill()

  // Legs
  ctx.fillStyle = darkenColor(bodyColor, 30)
  ctx.beginPath()
  ctx.ellipse(cx - 18, bodyY + 92, 14, 11, -0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 18, bodyY + 92, 14, 11, 0.1, 0, Math.PI * 2)
  ctx.fill()

  // Head
  const headGrad = ctx.createRadialGradient(cx - 12, cy - headR * 0.4, 5, cx, cy, headR)
  headGrad.addColorStop(0, lightenColor(bodyColor, 50))
  headGrad.addColorStop(0.7, bodyColor)
  headGrad.addColorStop(1, darkenColor(bodyColor, 10))

  ctx.beginPath()
  ctx.arc(cx, cy, headR, 0, Math.PI * 2)
  ctx.fillStyle = headGrad
  ctx.fill()
  ctx.strokeStyle = outlineColor
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Pet-type accessories
  if (petType === 'angel') {
    // Halo
    ctx.strokeStyle = '#ffdd44'
    ctx.lineWidth = 4
    ctx.shadowColor = '#ffdd44'
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.ellipse(cx, cy - headR - 10, 26, 7, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Wings
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = '#aaddff'
    ctx.beginPath()
    ctx.ellipse(cx - 50, bodyY + 10, 22, 35, -0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + 50, bodyY + 10, 22, 35, 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } else if (petType === 'mischief') {
    // Devil horns
    ctx.fillStyle = '#cc0000'
    ctx.shadowColor = '#ff0000'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(cx - 22, cy - headR + 5)
    ctx.lineTo(cx - 32, cy - headR - 22)
    ctx.lineTo(cx - 10, cy - headR)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(cx + 22, cy - headR + 5)
    ctx.lineTo(cx + 32, cy - headR - 22)
    ctx.lineTo(cx + 10, cy - headR)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0

    // Tail (visible on adult)
    ctx.strokeStyle = '#cc0000'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx + 40, bodyY + 70)
    ctx.bezierCurveTo(cx + 70, bodyY + 60, cx + 80, bodyY + 80, cx + 65, bodyY + 90)
    ctx.stroke()
  } else if (petType === 'sickly') {
    // Sweat drops always visible
    drawSweatDrops(ctx, cx, cy, t)
  } else {
    // Normal: smile mark on cheek
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#ff88aa'
    ctx.beginPath()
    ctx.ellipse(cx - 28, cy + 12, 10, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + 28, cy + 12, 10, 7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Shine
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx - 15, cy - headR * 0.45, 12, 18, -0.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawFace(ctx: CanvasRenderingContext2D, cx: number, cy: number, mood: PetMood, stage: PetStage) {
  const scale = stage === 'baby' ? 1 : stage === 'child' ? 1.1 : stage === 'teen' ? 1.0 : 0.95

  const eyeSpacing = 18 * scale
  const eyeSize = 12 * scale
  const pupilSize = 7 * scale
  const mouthY = cy + 16 * scale

  // Eyes
  const eyeY = cy - 5 * scale

  if (mood === 'sleeping') {
    // Closed eyes (curved lines)
    ctx.strokeStyle = '#222244'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx - eyeSpacing, eyeY, eyeSize * 0.7, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx + eyeSpacing, eyeY, eyeSize * 0.7, Math.PI * 0.1, Math.PI * 0.9)
    ctx.stroke()
  } else if (mood === 'sick' || mood === 'dead') {
    // X eyes
    ctx.strokeStyle = mood === 'dead' ? '#888899' : '#cc4466'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    const ex = eyeSize * 0.5
    ctx.beginPath()
    ctx.moveTo(cx - eyeSpacing - ex, eyeY - ex)
    ctx.lineTo(cx - eyeSpacing + ex, eyeY + ex)
    ctx.moveTo(cx - eyeSpacing + ex, eyeY - ex)
    ctx.lineTo(cx - eyeSpacing - ex, eyeY + ex)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + eyeSpacing - ex, eyeY - ex)
    ctx.lineTo(cx + eyeSpacing + ex, eyeY + ex)
    ctx.moveTo(cx + eyeSpacing + ex, eyeY - ex)
    ctx.lineTo(cx + eyeSpacing - ex, eyeY + ex)
    ctx.stroke()
  } else {
    // Normal eyes
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2)
    ctx.fill()

    // Pupils
    const pupilOffsetX = mood === 'happy' ? 2 : mood === 'sad' ? -1 : 0
    ctx.fillStyle = '#222244'
    ctx.beginPath()
    ctx.arc(cx - eyeSpacing + pupilOffsetX, eyeY + 2, pupilSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + eyeSpacing + pupilOffsetX, eyeY + 2, pupilSize, 0, Math.PI * 2)
    ctx.fill()

    // Shine
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx - eyeSpacing + pupilOffsetX + 3, eyeY, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + eyeSpacing + pupilOffsetX + 3, eyeY, 3, 0, Math.PI * 2)
    ctx.fill()

    // Happy squint
    if (mood === 'happy') {
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.fillStyle = '#ffaacc'
      ctx.beginPath()
      ctx.ellipse(cx - eyeSpacing, eyeY + eyeSize * 0.6, eyeSize, eyeSize * 0.35, 0, 0, Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx + eyeSpacing, eyeY + eyeSize * 0.6, eyeSize, eyeSize * 0.35, 0, 0, Math.PI)
      ctx.fill()
      ctx.restore()
    }
  }

  // Mouth
  ctx.strokeStyle = '#222244'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'

  if (mood === 'happy') {
    // Big curved smile
    ctx.beginPath()
    ctx.arc(cx, mouthY - 4, 14 * scale, 0, Math.PI)
    ctx.stroke()
    // Teeth
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx, mouthY - 4, 11 * scale, 0.1, Math.PI - 0.1)
    ctx.fill()
  } else if (mood === 'sad') {
    // Downturned mouth
    ctx.beginPath()
    ctx.arc(cx, mouthY + 8, 12 * scale, Math.PI, 0)
    ctx.stroke()
  } else if (mood === 'sick') {
    // Wavy mouth
    ctx.beginPath()
    ctx.moveTo(cx - 14 * scale, mouthY)
    ctx.bezierCurveTo(cx - 7 * scale, mouthY - 5, cx - 2 * scale, mouthY + 5, cx + 0, mouthY)
    ctx.bezierCurveTo(cx + 5 * scale, mouthY - 5, cx + 10 * scale, mouthY + 5, cx + 14 * scale, mouthY)
    ctx.stroke()

    // Green tinge overlay
    ctx.save()
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#00ff88'
    ctx.beginPath()
    ctx.arc(cx, cy, 35 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } else if (mood === 'dead') {
    // Sad flat line
    ctx.beginPath()
    ctx.moveTo(cx - 12 * scale, mouthY)
    ctx.lineTo(cx + 12 * scale, mouthY)
    ctx.stroke()
  } else if (mood === 'eating') {
    // Open mouth with food dots
    ctx.fillStyle = '#cc3333'
    ctx.beginPath()
    ctx.arc(cx, mouthY - 2, 10 * scale, 0, Math.PI)
    ctx.fill()
    ctx.fillStyle = '#ffaa44'
    ctx.beginPath()
    ctx.arc(cx - 4, mouthY - 2, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + 4, mouthY - 2, 3, 0, Math.PI * 2)
    ctx.fill()
  } else if (mood === 'sleeping') {
    // Small smile
    ctx.beginPath()
    ctx.arc(cx, mouthY - 4, 8 * scale, 0, Math.PI)
    ctx.stroke()
  } else if (mood === 'playing') {
    // Big open smile
    ctx.beginPath()
    ctx.arc(cx, mouthY - 4, 14 * scale, 0, Math.PI)
    ctx.stroke()
    ctx.strokeStyle = '#ff4466'
    ctx.lineWidth = 1.5
    // Tongue
    ctx.beginPath()
    ctx.arc(cx, mouthY + 2, 7 * scale, 0, Math.PI)
    ctx.stroke()
    ctx.fillStyle = '#ff4466'
    ctx.beginPath()
    ctx.arc(cx, mouthY + 2, 6 * scale, 0, Math.PI)
    ctx.fill()
  } else {
    // Neutral small smile
    ctx.beginPath()
    ctx.arc(cx, mouthY - 2, 10 * scale, 0.1, Math.PI - 0.1)
    ctx.stroke()
  }
}

function drawZZZ(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const chars = ['z', 'Z', 'Z']
  chars.forEach((char, i) => {
    const alpha = 0.3 + 0.5 * ((Math.sin(t * 1.5 + i * 0.8) + 1) / 2)
    const floatY = y - i * 18 - Math.sin(t + i) * 5
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#aaccff'
    ctx.font = `bold ${10 + i * 4}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(char, x + i * 6, floatY)
    ctx.restore()
  })
}

function drawSweatDrops(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const drops = [
    { x: cx - 42, y: cy - 20 },
    { x: cx + 44, y: cy - 15 },
  ]
  drops.forEach(({ x, y }, i) => {
    const fy = y + Math.sin(t * 2 + i) * 5
    ctx.save()
    ctx.globalAlpha = 0.7
    ctx.fillStyle = '#44aaff'
    ctx.beginPath()
    ctx.arc(x, fy + 6, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x, fy)
    ctx.lineTo(x - 4, fy + 7)
    ctx.lineTo(x + 4, fy + 7)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })
}

function drawPlayStars(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const stars = [
    { x: cx - 65, y: cy - 30, phase: 0 },
    { x: cx + 60, y: cy - 35, phase: 1 },
    { x: cx - 55, y: cy + 20, phase: 2 },
    { x: cx + 55, y: cy + 15, phase: 0.5 },
  ]
  stars.forEach(({ x, y, phase }) => {
    const alpha = 0.4 + 0.6 * ((Math.sin(t * 4 + phase) + 1) / 2)
    const size = 6 + Math.sin(t * 3 + phase) * 2

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#ffdd44'
    ctx.shadowColor = '#ffdd44'
    ctx.shadowBlur = 8
    ctx.translate(x, y)
    ctx.rotate(t * 2 + phase)
    ctx.beginPath()
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 - Math.PI / 2
      const a2 = ((p + 0.5) / 5) * Math.PI * 2 - Math.PI / 2
      if (p === 0) ctx.moveTo(Math.cos(a) * size, Math.sin(a) * size)
      else ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size)
      ctx.lineTo(Math.cos(a2) * size * 0.4, Math.sin(a2) * size * 0.4)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })
}

// Color helpers
function lightenColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`
}

function darkenColor(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`
}
