'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { getGsap, ScrollTrigger } from '@/lib/motion/gsap'
import { getLenis, prefersReducedMotion, setLenis } from '@/lib/motion/scroll'

/**
 * Owns the single Lenis instance and drives it from gsap.ticker so ScrollTrigger scenes
 * and every WebGL frame (also rendered from gsap.ticker) stay in lock-step.
 * With prefers-reduced-motion there is no Lenis at all: native scrolling, no smoothing.
 */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    const gsap = getGsap()
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // New route: jump to top without smoothing and let every trigger re-measure.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [pathname])

  return null
}
