import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'
import api from 'lib/api'
import UserLink from 'components/UI/user-link'
import IncButton from 'components/UI/inc-button'
import styles from './loans.module.scss'

LoanListItem.propTypes = {
  loan: PropTypes.object.isRequired,
  refreshLoansList: PropTypes.func.isRequired,
}
export default function LoanListItem({ loan, refreshLoansList }) {
  const userData = useUserData()
  const isMine = loan.lender.id === userData.id

  const cancelLoan = useCallback(() => {
    api
      .post('/v1/loans/cancel')
      .then(res => {
        refreshLoansList()
      })
      .catch(err => {
        alert(err.message)
      })
  }, [refreshLoansList])

  const takeLoan = useCallback(
    lenderID => () => {
      api
        .post('/v1/loans/take', { lender_id: lenderID })
        .then(res => {
          refreshLoansList()
        })
        .catch(err => {
          alert(err.message)
        })
    },
    [refreshLoansList]
  )

  const pri = 1 / (loan.interest_rate / 100 / LOAN_DAYS_DURATION)

  return (
    <div className={styles.loanItem} key={loan.lender.id}>
      <div>
        <UserLink user={loan.lender} />
      </div>

      <div>
        <p>
          <b>Interés</b>: {loan.interest_rate.toLocaleString()}%
        </p>
        <p>
          <b>Retorno de Inversión</b>: {Math.round(pri * 10) / 10} días
        </p>
      </div>

      <div>
        <IncButton onClick={isMine ? cancelLoan : takeLoan(loan.lender.id)}>
          {isMine ? 'Cancelar' : 'Solicitar'}
        </IncButton>
      </div>

      <div>{loan.money_amount.toLocaleString()}€</div>
    </div>
  )
}
