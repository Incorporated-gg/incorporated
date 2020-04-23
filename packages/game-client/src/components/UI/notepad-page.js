import React from 'react'
import styles from './notepad-page.module.scss'
import PropTypes from 'prop-types'

NotepadPage.propTypes = {
  className: PropTypes.string,
}
export default function NotepadPage({ className, ...props }) {
  return <div className={`${styles.container} ${className || ''}`} {...props} />
}
