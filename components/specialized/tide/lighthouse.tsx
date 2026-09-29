'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useRive, useStateMachineInput, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-canvas'

// Self-hosted runtime: the default CDN is not reachable everywhere.
RuntimeLoader.setWasmUrl('/rive/rive.wasm')

const STATE_MACHINE = 'Main State Machine'

/**
 * Rive lighthouse (MIT, from rive-app's runtime examples): its switch is wired to
 * day tide / night tide. The Rive canvas is decorative; the wrapping <button> is
 * the accessible control and drives both the theme and the state machine.
 */
export function Lighthouse() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const riveNight = useRef(false)

  const { rive, RiveComponent } = useRive({
    src: '/rive/lighthouse.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Cover, alignment: Alignment.Center }),
  })
  const click = useStateMachineInput(rive, STATE_MACHINE, 'Click')
  const hover = useStateMachineInput(rive, STATE_MACHINE, 'Hover')
  // Rive inputs are mutable handles; keep them behind a ref so handlers can set them.
  const hoverRef = useRef(hover)
  useEffect(() => {
    hoverRef.current = hover
  }, [hover])
  const setHover = (on: boolean) => {
    if (hoverRef.current) hoverRef.current.value = on
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  // Keep the lighthouse in step with the theme, whichever control changed it.
  useEffect(() => {
    if (!click || !mounted) return
    if (riveNight.current !== isDark) {
      click.fire()
      riveNight.current = isDark
    }
  }, [click, isDark, mounted])

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      aria-pressed={isDark}
      aria-label={isDark ? 'Lighthouse: switch to day tide' : 'Lighthouse: switch to night tide'}
      className="group shadow-lift relative block aspect-[6/5] w-full overflow-hidden rounded-[1.5rem] bg-[#2a2f33] transition-[scale] duration-150 ease-out active:scale-[0.96]"
    >
      <RiveComponent
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full [filter:saturate(0.22)_contrast(1.05)_brightness(1.02)]"
      />
      <span className="eyebrow bg-background/85 text-foreground shadow-border absolute bottom-4 left-4 rounded-full px-3 py-1.5 backdrop-blur-sm">
        {isDark ? 'Night tide' : 'Day tide'} — tap the light
      </span>
    </button>
  )
}
