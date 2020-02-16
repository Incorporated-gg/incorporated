import React, { useState } from 'react'
import { post } from '../../lib/api'
import PropTypes from 'prop-types'
import styles from './loans.module.scss'

const LOAN_DAYS_DURATION = 7
CreateLoan.propTypes = {
  givenLoan: PropTypes.object,
  refreshLoansList: PropTypes.func.isRequired,
}
export default function CreateLoan({ refreshLoansList, givenLoan }) {
  const [moneyAmount, setMoneyAmount] = useState(0)
  const [interestRate, setInterestRate] = useState(15)

  const postLoan = () => {
    setMoneyAmount(0)
    setInterestRate(15)
    post('/v1/loans/create', {
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

  return givenLoan ? (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        Has dado un préstamo.
        {givenLoan.borrower && (
          <>
            {' '}
            Quedan{' '}
            {Math.ceil(
              givenLoan.loan_started_at +
                60 * 60 * 24 * LOAN_DAYS_DURATION -
                Math.floor(Date.now() / 1000) / (60 * 60 * 24)
            )}{' '}
            días
          </>
        )}
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.title}>{'OFRECER PRÉSTAMO'}</div>
      <div className={styles.contentContainer}>
        <p>
          Cantidad de dinero:
          <input value={moneyAmount} type="number" placeholder="0" onChange={e => setMoneyAmount(e.target.value)} />
        </p>
        <p>
          Interés:
          <input value={interestRate} type="range" min="5" max="30" onChange={e => setInterestRate(e.target.value)} />
          {interestRate}%
        </p>
        <p>Duración: {LOAN_DAYS_DURATION.toLocaleString()} días</p>
        <button type="button" onClick={postLoan}>
          Publicar
        </button>
      </div>
    </div>
  )
}
