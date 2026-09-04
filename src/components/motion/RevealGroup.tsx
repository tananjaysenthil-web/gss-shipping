import { createElement, useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { revealStagger } from '../../lib/motion'

type RevealGroupProps = {
  children: ReactNode
  as?: ElementType
  each?: number
  className?: string
}

/** Staggers the fade+rise of its direct children as the group scrolls into view. */
export function RevealGroup({ children, as = 'div', each, className }: RevealGroupProps) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      if (ref.current) revealStagger(ref.current, { each })
    },
    { scope: ref },
  )

  return createElement(as, { ref, className }, children)
}
