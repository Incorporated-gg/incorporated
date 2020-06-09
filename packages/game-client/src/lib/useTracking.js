import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

const trackingId = 'UA-67731642-5'
export const useTracking = () => {
  const { listen } = useHistory()

  useEffect(() => {
    const unlisten = listen((location) => {
      if (!window.gtag) return

      window.gtag('config', trackingId, { page_path: location.pathname })
    })

    return unlisten
  }, [trackingId, listen])
}
