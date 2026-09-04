import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false
export function ensureGsapRegistered() {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Fade+rise reveal for a single element, tied to scroll entry. No-ops final state under reduced motion. */
export function revealOnScroll(el: Element, opts: { delay?: number; y?: number } = {}) {
  ensureGsapRegistered()
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, y: 0 })
    return
  }
  gsap.from(el, {
    opacity: 0,
    y: opts.y ?? 20,
    duration: 0.5,
    delay: opts.delay ?? 0,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
  })
}

/** Staggered fade+rise for a container's direct children. */
export function revealStagger(container: Element, opts: { each?: number; y?: number } = {}) {
  ensureGsapRegistered()
  const children = container.children
  if (prefersReducedMotion()) {
    gsap.set(children, { opacity: 1, y: 0 })
    return
  }
  gsap.from(children, {
    opacity: 0,
    y: opts.y ?? 24,
    duration: 0.5,
    stagger: opts.each ?? 0.08,
    ease: 'power2.out',
    scrollTrigger: { trigger: container, start: 'top 85%', toggleActions: 'play none none reverse' },
  })
}

/** Count from 0 to `target` once the element scrolls into view. */
export function countUpOnScroll(el: HTMLElement, target: number, opts: { suffix?: string; duration?: number } = {}) {
  ensureGsapRegistered()
  if (prefersReducedMotion()) {
    el.textContent = `${target}${opts.suffix ?? ''}`
    return
  }
  const counter = { val: 0 }
  gsap.to(counter, {
    val: target,
    duration: opts.duration ?? 1.2,
    ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => {
      el.textContent = `${Math.round(counter.val)}${opts.suffix ?? ''}`
    },
  })
}

/** Subtle lift on hover — transform/opacity only, stays on the compositor thread. */
export function attachHoverLift(el: HTMLElement, opts: { y?: number; scale?: number } = {}) {
  if (prefersReducedMotion()) return () => {}
  const enter = () => gsap.to(el, { y: opts.y ?? -4, scale: opts.scale ?? 1.01, duration: 0.25, ease: 'power2.out' })
  const leave = () => gsap.to(el, { y: 0, scale: 1, duration: 0.25, ease: 'power2.out' })
  el.addEventListener('pointerenter', enter)
  el.addEventListener('pointerleave', leave)
  return () => {
    el.removeEventListener('pointerenter', enter)
    el.removeEventListener('pointerleave', leave)
  }
}

export { gsap }
