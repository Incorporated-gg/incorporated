import React from 'react'
import researchUtils from 'shared-lib/researchUtils'
import ResearchItem from './ResearchItem'
import styles from './Research.module.scss'

export default function Researchs() {
  return (
    <div className={styles.list}>
      <div className={styles.background} />
      <div className={styles.content}>
        {researchUtils.researchList
          .filter(b => b.id !== 5) // Hide optimize buildings research, as it's shown in buildings page
          .map(b => (
            <ResearchItem key={b.id} researchID={b.id} />
          ))}
      </div>
    </div>
  )
}
