'use client'

import { useState } from 'react'
import { MatrixRain } from '@/components/ui/matrix-rain'
import { useKonamiCode } from '@/hooks/use-konami-code'

export function GlobalEffects() {
  const [showMatrix, setShowMatrix] = useState(false)

  useKonamiCode(() => {
    setShowMatrix(true)
  })

  return <MatrixRain isActive={showMatrix} onClose={() => setShowMatrix(false)} />
}
