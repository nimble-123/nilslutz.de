import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

let registered = false

/** Registers GSAP plugins exactly once (client only) and returns the configured gsap. */
export function getGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText)
    registered = true
  }
  return gsap
}

export { gsap, ScrollTrigger, SplitText }
