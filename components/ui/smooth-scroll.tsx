'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null

/** Current Lenis instance (null when reduced motion is requested) */
export const getLenis = () => lenis

/**
 * Lenis smooth scroll, driven from gsap.ticker so ScrollTrigger and the WebGL frame share one clock.
 * Disabled entirely for prefers-reduced-motion.
 */
export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: true })
    lenis = instance
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])

  // New route: start at the top and re-measure triggers
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
