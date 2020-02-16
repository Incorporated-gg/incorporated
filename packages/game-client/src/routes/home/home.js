import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

export default function Home() {
  const history = useHistory()

  useEffect(() => {
    history.replace('/buildings')
  }, [history])
  return null
}
