import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { countUpOnScroll } from '../../lib/motion'

type CounterProps = {
  target: number
  suffix?: string
  className?: string
}

export function Counter({ target, suffix, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (ref.current) countUpOnScroll(ref.current, target, { suffix })
    },
    { scope: ref, dependencies: [target, suffix] },
  )

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}
