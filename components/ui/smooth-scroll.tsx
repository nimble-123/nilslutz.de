'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

export function getLenis() {
  return lenisInstance
}

/**
 * Lenis smooth scrolling driven from gsap.ticker, so ScrollTrigger scenes and
 * every WebGL frame (also rendered from gsap.ticker) advance in the same tick.
 * Disabled entirely for prefers-reduced-motion.
 */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.9 })
    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true, force: true })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
