'use client'

import { useEffect, useState, useCallback } from 'react'

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonamiCode(callback: () => void) {
  const [keys, setKeys] = useState<string[]>([])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      setKeys((prevKeys) => {
        const newKeys = [...prevKeys, event.key].slice(-KONAMI_CODE.length)

        // Check if the sequence matches
        if (newKeys.join(',') === KONAMI_CODE.join(',')) {
          callback()
          return [] // Reset after successful activation
        }

        return newKeys
      })
    },
    [callback]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Reset keys after 5 seconds of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      setKeys([])
    }, 5000)

    return () => clearTimeout(timeout)
  }, [keys])
}
