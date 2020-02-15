import useWindowSize from './useWindowSize'
import { DESKTOP_WIDTH_BREAKPOINT } from './utils'

export default function useIsDesktop() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT
  return isDesktop
}
