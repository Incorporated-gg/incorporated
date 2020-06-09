import {  useLocation } from 'react-router-dom'
import { userData } from './user'
import { useEffect } from 'react'

const trackingID = 'UA-67731642-5'
export function useTracking() {
  const location = useLocation()

  useEffect(() => {
    if (!window.gtag) return
    window.gtag('config', trackingID, {
      page_path: location.pathname,
      user_id: userData ? userData.id : undefined
    })
  }, [location])
}
