import React from 'react'
import Menu from '../menu/menu'
import useWindowSize from 'lib/useWindowSize'
import { DESKTOP_WIDTH_BREAKPOINT } from 'lib/utils'
import styles from './footer.module.scss'

export default function Footer() {
  const dimensions = useWindowSize()
  const isDesktop = dimensions.width >= DESKTOP_WIDTH_BREAKPOINT

  if (isDesktop) return null
  return (
    <div className={styles.footer}>
      <Menu />
    </div>
  )
}
