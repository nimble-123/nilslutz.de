'use client'

import { cn } from '@/lib/utils'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface TypewriterEffectProps {
  segments: {
    text: string
    className?: string
  }[]
  className?: string
  cursorClassName?: string
  speed?: number
}

export function TypewriterEffect({ segments, className, cursorClassName, speed = 0.03 }: TypewriterEffectProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed,
      },
    },
  }

  const child = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  // Flatten segments into characters with their classes
  const characters = segments.flatMap((segment) =>
    segment.text.split('').map((char) => ({
      char,
      className: segment.className,
    }))
  )

  return (
    <motion.p
      ref={ref}
      className={cn('inline-block', className)}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {characters.map((item, index) => (
        <motion.span key={index} variants={child} className={item.className}>
          {item.char}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className={cn('bg-primary ml-1 inline-block h-[1em] w-[2px] align-middle', cursorClassName)}
      />
    </motion.p>
  )
}
