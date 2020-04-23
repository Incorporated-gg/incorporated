import React, { useState } from 'react'
import api from 'lib/api'
import PropTypes from 'prop-types'
import styles from './loans.module.scss'
import IncContainer from 'components/UI/inc-container'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'
import IncButton from 'components/UI/inc-button'

CreateLoan.propTypes = {
  givenLoan: PropTypes.object,
  refreshLoansList: PropTypes.func.isRequired,
}
export default function CreateLoan({ refreshLoansList, givenLoan }) {
  const [moneyAmount, setMoneyAmount] = useState('')
  const [interestRate, setInterestRate] = useState(25)

  const pri = 1 / (interestRate / 100 / LOAN_DAYS_DURATION)

  const postLoan = () => {
    setMoneyAmount(0)
    setInterestRate(15)
    api
      .post('/v1/loans/create', {
        money_amount: moneyAmount,
        interest_rate: interestRate,
      })
      .then(() => {
        refreshLoansList()
      })
      .catch(err => {
        setMoneyAmount(moneyAmount)
        setInterestRate(interestRate)
        alert(err.message)
      })
  }

  if (givenLoan && givenLoan.borrower) {
    const remainingSeconds =
      givenLoan.loan_started_at + 60 * 60 * 24 * LOAN_DAYS_DURATION - Math.floor(Date.now() / 1000)
    const remainingTime = Math.ceil(remainingSeconds / (60 * 60 * 24))
    return (
      <IncContainer darkBg>
        <div className={styles.contentContainer}>Aún estás dando un préstamo, quedan {remainingTime} días</div>
      </IncContainer>
    )
  }

  if (givenLoan && !givenLoan.borrower) {
    return null // Puedes cancelar en la lista
  }

  return (
    <IncContainer darkBg>
      <div className={styles.contentContainer}>
        <div className={styles.title}>{'OFRECER PRÉSTAMO'}</div>

        <div className={styles.createLoanRow}>
          <div>
            <div className={styles.smallTitle}>Cantidad</div>
            <input value={moneyAmount} type="number" placeholder="0" onChange={e => setMoneyAmount(e.target.value)} />
          </div>
          <div>
            <div className={styles.smallTitle}>Interés</div>
            <input
              value={interestRate}
              type="range"
              min="5"
              max="50"
              step="1"
              onChange={e => setInterestRate(e.target.value)}
            />
            {interestRate}%
          </div>
        </div>
        <div className={styles.createLoanRow}>
          <div>
            <div className={styles.smallTitle}>Retorno de Inversión: {Math.round(pri * 10) / 10} días</div>
            <div className={styles.smallTitle}>Duración: {LOAN_DAYS_DURATION} días</div>
          </div>
          <div>
            <IncButton onClick={postLoan}>
              <span style={{ padding: '0 20px' }}>Publicar</span>
            </IncButton>
          </div>
        </div>
      </div>
    </IncContainer>
  )
}
