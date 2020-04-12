import { useEffect, useRef, useCallback, useMemo } from 'react'

export default function useHoldPress({ callback, ms, rampUpMs, initialMs, endMs }) {
  if (ms && (rampUpMs || initialMs || endMs))
    throw new Error(
      'You have to chose either ms (always same ms between callbacks) or rampUpMs, initialMs, endMs (increasing/decreasing ms)'
    )

  const pressedInterval = useRef()

  const startHoldPress = useCallback(() => {
    if (pressedInterval.current) return
    callback()
    const timingFn = ms ? () => ms : msElapsed => mapNumberRange(msElapsed, 0, rampUpMs, initialMs, endMs)
    pressedInterval.current && pressedInterval.current.stop()
    pressedInterval.current = setVariableInterval(callback, timingFn)
  }, [callback, endMs, initialMs, ms, rampUpMs])

  const stopHoldPress = useCallback(() => {
    pressedInterval.current && pressedInterval.current.stop()

    setTimeout(() => {
      // Hack to avoid double callback on single press in mobile.
      // Events are fired in this order: onTouchStart, onTouchEnd, onMouseUp, onMouseDown
      pressedInterval.current = undefined
    }, 10)
  }, [])

  useEffect(() => {
    return stopHoldPress
  }, [stopHoldPress])

  return useMemo(
    () => ({
      onMouseDown: startHoldPress,
      onMouseUp: stopHoldPress,
      onMouseLeave: stopHoldPress,
      onTouchStart: startHoldPress,
      onTouchEnd: stopHoldPress,
    }),
    [startHoldPress, stopHoldPress]
  )
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
