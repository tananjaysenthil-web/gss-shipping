import { useEffect, useState } from 'react'

function detectWebgl(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function useWebglSupport(): boolean {
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    setSupported(detectWebgl())
  }, [])
  return supported
}
