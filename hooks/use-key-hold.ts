"use client"

import { useEffect, useRef, useState } from "react"

interface UseKeyHoldOptions {
  onTap?: () => void
  onHold?: () => void
  onRelease?: () => void
  holdDuration?: number // ms before considered "hold"
}

export function useKeyHold(key: string, options: UseKeyHoldOptions) {
  const { onTap, onHold, onRelease, holdDuration = 300 } = options
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const wasHeldRef = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      if (e.repeat) return // Ignore key repeat

      // Start hold timer
      wasHeldRef.current = false
      setIsHolding(true)

      holdTimerRef.current = setTimeout(() => {
        wasHeldRef.current = true
        onHold?.()
      }, holdDuration)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return

      setIsHolding(false)

      // Clear timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }

      // Determine if tap or hold
      if (wasHeldRef.current) {
        onRelease?.()
      } else {
        onTap?.()
      }

      wasHeldRef.current = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
    }
  }, [key, onTap, onHold, onRelease, holdDuration])

  return { isHolding }
}

interface UseIdleDetectorOptions {
  onIdle?: () => void
  onActive?: () => void
  idleDuration?: number // ms
}

export function useIdleDetector(options: UseIdleDetectorOptions) {
  const { onIdle, onActive, idleDuration = 15000 } = options
  const [isIdle, setIsIdle] = useState(false)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const resetIdleTimer = () => {
      if (isIdle) {
        setIsIdle(false)
        onActive?.()
      }

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }

      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true)
        onIdle?.()
      }, idleDuration)
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    // Initial timer
    resetIdleTimer()

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [isIdle, onIdle, onActive, idleDuration])

  return { isIdle }
}
