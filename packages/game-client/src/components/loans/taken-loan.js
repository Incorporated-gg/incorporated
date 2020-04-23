import React from 'react'
import PropTypes from 'prop-types'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'
import IncContainer from 'components/UI/inc-container'
import styles from './loans.module.scss'

TakenLoan.propTypes = {
  takenLoan: PropTypes.object.isRequired,
}
export default function TakenLoan({ takenLoan }) {
  const remainingSeconds = takenLoan.loan_started_at + 60 * 60 * 24 * LOAN_DAYS_DURATION - Math.floor(Date.now() / 1000)
  const remainingTime = Math.ceil(remainingSeconds / (60 * 60 * 24))
  return (
    <IncContainer darkBg>
      <div className={styles.contentContainer}>Has pedido un préstamo. Quedan {remainingTime} días</div>
    </IncContainer>
  )
}
