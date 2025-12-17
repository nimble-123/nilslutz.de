'use client'

import { cn } from '@/lib/utils'
import { useInView } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

interface TypewriterEffectProps {
  segments: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  speed?: number
}

export function TypewriterEffect({ segments, className, cursorClassName, speed = 50 }: TypewriterEffectProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayedText, setDisplayedText] = useState<Array<{ char: string; className?: string }>>([])
  const [isComplete, setIsComplete] = useState(false)

  // Flatten segments into characters with their classes - memoized to prevent recreation
  const characters = useMemo(
    () =>
      segments.flatMap((segment) =>
        segment.text.split('').map((char) => ({
          char,
          className: segment.className,
        }))
      ),
    [segments]
  )

  useEffect(() => {
    if (!isInView || characters.length === 0) return

    let currentIndex = 0
    setDisplayedText([])
    setIsComplete(false)

    const timer = setInterval(() => {
      if (currentIndex < characters.length) {
        const nextChar = characters[currentIndex]
        if (nextChar) {
          setDisplayedText((prev) => [...prev, nextChar])
        }
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [isInView, speed, characters])

  return (
    <p ref={ref} className={cn('inline-block', className)}>
      {displayedText.filter(Boolean).map((item, index) => (
        <span key={index} className={item?.className}>
          {item?.char}
        </span>
      ))}
      {!isComplete && (
        <span
          className={cn('bg-primary ml-[1px] inline-block h-[1em] w-[2px] animate-pulse align-middle', cursorClassName)}
        />
      )}
    </p>
  )
}
