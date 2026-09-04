import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { attachHoverLift } from '../lib/motion'

export function useHoverLift<T extends HTMLElement>(opts?: { y?: number; scale?: number }) {
  const ref = useRef<T>(null)

  useGSAP(() => {
    if (!ref.current) return
    return attachHoverLift(ref.current, opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
