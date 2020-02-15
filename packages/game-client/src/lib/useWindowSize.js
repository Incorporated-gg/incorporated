import React from 'react'
import { debounce } from 'lib/utils'

export default function useWindowSize({ debounceMs = 100 } = {}) {
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth,
  })
  React.useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      })
    }, debounceMs)

    window.addEventListener('resize', debouncedHandleResize)

    return () => window.removeEventListener('resize', debouncedHandleResize)
  })
  return dimensions
}
