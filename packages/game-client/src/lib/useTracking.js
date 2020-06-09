import {  useLocation } from 'react-router-dom'
import { userData } from './user'

const trackingId = 'UA-67731642-5'
export function useTracking() {
  const location = useLocation()

  if (!window.gtag) return
  window.gtag('config', trackingId, {
    page_path: location.pathname,
    user_id: userData ? userData.id : undefined
  })
}
