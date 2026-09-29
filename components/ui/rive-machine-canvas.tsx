'use client'

import { useEffect, useState } from 'react'
import { Layout, Fit, Alignment, RuntimeLoader, useRive, useStateMachineInput } from '@rive-app/react-canvas'

// Self-hosted runtime: cdn.rive.app / jsdelivr are not needed (and not reachable everywhere)
RuntimeLoader.setWasmUrl('/rive/rive.wasm')
RuntimeLoader.setWasmFallbackUrl(null)

const STATE_MACHINE = 'State Machine 1'

/**
 * "Little Machine" — MIT-licensed example asset from github.com/rive-app/rive-flutter.
 * Its state machine has one trigger ("Trigger 1") that makes the machine process a data card.
 */
export default function RiveMachineCanvas({ fire, reduced }: { fire: number; reduced: boolean }) {
  const [failed, setFailed] = useState(false)
  const { rive, RiveComponent } = useRive({
    src: '/rive/little-machine.riv',
    stateMachines: STATE_MACHINE,
    autoplay: !reduced,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  })
  const trigger = useStateMachineInput(rive, STATE_MACHINE, 'Trigger 1')

  useEffect(() => {
    if (fire > 0) {
      if (reduced) rive?.play()
      trigger?.fire()
    }
  }, [fire, trigger, rive, reduced])

  if (failed) return null
  return <RiveComponent className="size-full" aria-hidden="true" />
}
