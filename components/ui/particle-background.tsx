'use client'

import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useEffect, useMemo, useState } from 'react'
import type { Container, ISourceOptions } from '@tsparticles/engine'

interface ParticleBackgroundProps {
  className?: string
  particleCount?: number
  connectionDistance?: number
  particleColor?: string
  lineColor?: string
  particleSize?: number
  speed?: number
}

export function ParticleBackground({
  className = '',
  particleCount = 200,
  connectionDistance = 150,
  particleColor = 'rgba(99, 102, 241, 0.5)', // indigo-500 with opacity
  lineColor = 'rgba(99, 102, 241, 0.15)',
  particleSize = 2,
  speed = 0.5,
}: ParticleBackgroundProps) {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: 'transparent',
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: 'repulse',
          },
          resize: {
            enable: true,
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColor,
        },
        links: {
          color: lineColor,
          distance: connectionDistance,
          enable: true,
          opacity: 0.15,
          width: 1,
        },
        move: {
          direction: 'none',
          enable: true,
          outModes: {
            default: 'bounce',
          },
          random: false,
          speed: speed,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: particleCount,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: 'circle',
        },
        size: {
          value: { min: particleSize, max: particleSize },
        },
      },
      detectRetina: true,
    }),
    [particleCount, connectionDistance, particleColor, lineColor, particleSize, speed]
  )

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Particles loaded', container)
  }

  if (!init) {
    return null
  }

  return <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={options} className={className} />
}
