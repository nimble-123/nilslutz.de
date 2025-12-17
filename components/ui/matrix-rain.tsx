'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MatrixRainProps {
  isActive: boolean
  onClose: () => void
}

export function MatrixRain({ isActive, onClose }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onCloseRef = useRef(onClose)

  // Keep onClose ref up to date
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas to full screen
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Matrix characters - SAP/BTP themed
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()САП¥£€<>[]{}|/\\BTP'
    const charArray = chars.split('')

    const fontSize = 16
    const columns = canvas.width / fontSize

    // Array of drops - one per column
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100)
    }

    let animationFrameId: number

    function draw() {
      if (!ctx || !canvas) return

      // Black background with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green text
      ctx.fillStyle = '#0F0'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(text, x, y)

        // Reset drop to top randomly after it crosses the screen
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i]++
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    // Auto-close after 10 seconds
    const timeout = setTimeout(() => {
      onCloseRef.current()
    }, 10000)

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(timeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Center text overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative z-10 text-center"
          >
            <h2 className="mb-4 font-mono text-4xl font-bold text-green-400 md:text-6xl">WAKE UP, NEO...</h2>
            <p className="font-mono text-xl text-green-400 md:text-2xl">The SAP BTP has you.</p>
            <p className="mt-4 font-mono text-sm text-green-400/70">(Click anywhere or wait 10s to exit)</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
