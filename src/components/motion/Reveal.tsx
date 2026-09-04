import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { revealOnScroll } from '../../lib/motion'

type RevealProps = {
  children: ReactNode
  as?: ElementType
  delay?: number
  className?: string
  id?: string
}

/** Fades + rises a section into place as it scrolls into view. */
export function Reveal({ children, as = 'div', delay, className, id }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      if (ref.current) revealOnScroll(ref.current, { delay })
    },
    { scope: ref },
  )

  return createElement(as, { ref, className, id }, children)
}
