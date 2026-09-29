'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

/** Access the shared Lenis instance (null when reduced motion is requested). */
export function getLenis() {
  return lenisInstance
}

/**
 * Smooth scrolling driven from gsap.ticker, so Lenis, ScrollTrigger and
 * the WebGL frame all advance in the same tick. Disabled for reduced motion.
 */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.2,
    })
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

  // New route: start at the top and let triggers re-measure.
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
