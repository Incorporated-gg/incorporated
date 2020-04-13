import { useEffect, useRef, useCallback, useMemo } from 'react'

export default function useHoldPress({ callback, ms, rampUpMs, initialMs, endMs }) {
  if (ms && (rampUpMs || initialMs || endMs))
    throw new Error(
      'You have to chose either ms (always same ms between callbacks) or rampUpMs, initialMs, endMs (increasing/decreasing ms)'
    )

  const TOUCH_MOVE_STOP_PX = 5 // Stop holdPress after moving X pixels. Only for touch
  const isTouchDevice = useRef(false) // Will be set to true on onTouchStart. It's always fired before onMouseUp so that's fine by us

  // Call callback while pressed. Shared for touch and mouse
  const variableIntervalRef = useRef()

  const startHoldPress = useCallback(() => {
    if (variableIntervalRef.current) variableIntervalRef.current.stop()
    const timingFn = ms ? () => ms : msElapsed => mapNumberRange(msElapsed, 0, rampUpMs, initialMs, endMs)
    variableIntervalRef.current = setVariableInterval(callback, timingFn)
    callback()
  }, [callback, endMs, initialMs, ms, rampUpMs])

  const stopHoldPress = useCallback(() => {
    if (variableIntervalRef.current) variableIntervalRef.current.stop()
    variableIntervalRef.current = undefined
  }, [])

  useEffect(() => {
    return stopHoldPress
  }, [stopHoldPress])

  const { onTouchStart, onTouchEnd, onTouchMove } = useHoldTouchEvents({
    callback,
    startHoldPress,
    stopHoldPress,
    isTouchDevice,
    TOUCH_MOVE_STOP_PX,
  })
  const { onMouseDown, onMouseLeave, onMouseUp } = useHoldMouseClickEvents({
    startHoldPress,
    stopHoldPress,
    isTouchDevice,
  })

  return useMemo(
    () => ({
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
      onTouchMove,
    }),
    [onMouseDown, onMouseLeave, onMouseUp, onTouchEnd, onTouchMove, onTouchStart]
  )
}

function useHoldTouchEvents({ callback, startHoldPress, stopHoldPress, isTouchDevice, TOUCH_MOVE_STOP_PX }) {
  const touchStartTimeoutRef = useRef(null)
  const touchStartPositionRef = useRef()

  const onTouchStart = useCallback(
    e => {
      isTouchDevice.current = true // To ignore mouse click events

      const touch = e.touches[0]
      touchStartPositionRef.current = { x: touch.pageX, y: touch.pageY }
      clearTimeout(touchStartTimeoutRef.current)
      touchStartTimeoutRef.current = setTimeout(startHoldPress, 300)
    },
    [isTouchDevice, startHoldPress]
  )

  const onTouchEnd = useCallback(() => {
    if (touchStartTimeoutRef.current !== null) {
      clearTimeout(touchStartTimeoutRef.current)
      touchStartTimeoutRef.current = null
      callback() // It was a tap. Send a single callback
    }
    stopHoldPress()
  }, [callback, stopHoldPress])

  const onTouchMove = useCallback(
    e => {
      const touch = e.touches[0]
      const diff =
        Math.abs(touch.pageX - touchStartPositionRef.current.x) +
        Math.abs(touch.pageY - touchStartPositionRef.current.y)
      if (diff < TOUCH_MOVE_STOP_PX) return

      if (touchStartTimeoutRef.current !== null) {
        clearTimeout(touchStartTimeoutRef.current)
        touchStartTimeoutRef.current = null
      }
      stopHoldPress()
    },
    [TOUCH_MOVE_STOP_PX, stopHoldPress]
  )

  return { onTouchStart, onTouchEnd, onTouchMove }
}

function useHoldMouseClickEvents({ startHoldPress, stopHoldPress, isTouchDevice }) {
  const onMouseDown = useCallback(() => {
    if (isTouchDevice.current) return
    startHoldPress()
  }, [isTouchDevice, startHoldPress])

  const onMouseUp = useCallback(() => {
    if (isTouchDevice.current) return
    stopHoldPress()
  }, [isTouchDevice, stopHoldPress])

  const onMouseLeave = useCallback(() => {
    if (isTouchDevice.current) return
    stopHoldPress()
  }, [isTouchDevice, stopHoldPress])

  return { onMouseDown, onMouseLeave, onMouseUp }
}

function setVariableInterval(callbackFunc, timingFn) {
  let initialMs = Date.now()
  let timeout
  function loop() {
    timeout = setTimeout(() => {
      callbackFunc()
      loop()
    }, timingFn(Date.now() - initialMs))
  }
  loop()

  return {
    stop: () => clearTimeout(timeout),
  }
}

function mapNumberRange(value, inMin, inMax, outMin, outMax, clip = true) {
  if (clip) {
    if (value < inMin) value = inMin
    if (value > inMax) value = inMax
  }
  const result = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  return result
}
