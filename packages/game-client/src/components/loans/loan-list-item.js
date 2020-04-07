import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useUserData } from '../../lib/user'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'
import api from 'lib/api'
import UserLink from 'components/UI/UserLink'

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

  return (
    <div key={loan.lender.id}>
      <UserLink user={loan.lender} />
      <p>
        <b>Interés</b>: {loan.interest_rate.toLocaleString()}%
      </p>
      <p>
        <b>Dinero</b>: {loan.money_amount.toLocaleString()}€
      </p>
      <p>
        <b>Duración</b>: {LOAN_DAYS_DURATION.toLocaleString()} días
      </p>

      {isMine ? (
        <button type="button" onClick={cancelLoan}>
          Cancelar préstamo
        </button>
      ) : (
        <button type="button" onClick={takeLoan(loan.lender.id)}>
          Coger préstamo
        </button>
      )}
    </div>
  )
}
