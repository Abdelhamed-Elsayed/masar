import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/store/themeStore'

interface NetworkNode {
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
  glow: string
}

const PALETTES = {
  light: { line: '15, 118, 110', node: 'rgba(15, 118, 110, 0.8)', nodeAlt: 'rgba(11, 45, 70, 0.85)' },
  dark: { line: '212, 175, 55', node: 'rgba(226, 193, 90, 0.85)', nodeAlt: 'rgba(255, 255, 255, 0.9)' },
} as const

export function NetworkBackground() {
  const theme = useThemeStore((state) => state.theme)
  const palette = PALETTES[theme]
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const activeCanvas = canvas
    const drawingContext = context

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = 0
    let width = 0
    let height = 0
    let nodes: NetworkNode[] = []
    let lastFrame = 0

    function draw(time: number, animate: boolean) {
      if (animate && time - lastFrame < 32) {
        frameId = window.requestAnimationFrame((nextTime) => draw(nextTime, true))
        return
      }
      if (animate) lastFrame = time
      drawingContext.clearRect(0, 0, width, height)

      nodes.forEach((node, index) => {
        if (animate) {
          node.x += node.velocityX
          node.y += node.velocityY
          if (node.x < 0 || node.x > width) node.velocityX *= -1
          if (node.y < 0 || node.y > height) node.velocityY *= -1
        }

        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const other = nodes[otherIndex]
          if (!other) continue
          const distance = Math.hypot(node.x - other.x, node.y - other.y)
          if (distance > 172) continue
          const opacity = (1 - distance / 172) * 0.38
          drawingContext.beginPath()
          drawingContext.moveTo(node.x, node.y)
          drawingContext.lineTo(other.x, other.y)
          drawingContext.strokeStyle = `rgba(${palette.line}, ${opacity})`
          drawingContext.lineWidth = 0.7
          drawingContext.stroke()
        }

        drawingContext.beginPath()
        drawingContext.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        drawingContext.fillStyle = node.glow
        drawingContext.shadowColor = node.glow
        drawingContext.shadowBlur = 14
        drawingContext.fill()
        drawingContext.shadowBlur = 0
      })

      if (animate) frameId = window.requestAnimationFrame((nextTime) => draw(nextTime, true))
    }

    function resize() {
      const bounds = activeCanvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = bounds.width
      height = bounds.height
      activeCanvas.width = Math.round(width * pixelRatio)
      activeCanvas.height = Math.round(height * pixelRatio)
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      const nodeCount = Math.min(100, Math.max(42, Math.round((width * height) / 8500)))
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        velocityX: (Math.random() - 0.5) * 0.34,
        velocityY: (Math.random() - 0.5) * 0.34,
        radius: Math.random() > 0.87 ? 2 : 1.1,
        glow: Math.random() > 0.76 ? palette.nodeAlt : palette.node,
      }))
      window.cancelAnimationFrame(frameId)
      lastFrame = window.performance.now() - 32
      draw(0, !reducedMotion.matches)
    }

    function updateMotionPreference() {
      window.cancelAnimationFrame(frameId)
      draw(0, !reducedMotion.matches)
    }

    resize()
    window.addEventListener('resize', resize)
    reducedMotion.addEventListener('change', updateMotionPreference)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      reducedMotion.removeEventListener('change', updateMotionPreference)
    }
  }, [palette])

  return <canvas ref={canvasRef} aria-hidden="true" className="company-network-canvas pointer-events-none absolute inset-0 size-full" />
}
