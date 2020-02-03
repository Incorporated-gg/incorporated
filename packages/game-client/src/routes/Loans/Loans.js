import React, { useEffect, useState, useCallback } from 'react'
import api from '../../lib/api'
import Username from '../../components/Username'
import GiveLoan from './GiveLoan'
import { useUserData } from '../../lib/user'

const LOAN_DAYS_DURATION = 7
export default function Loans() {
  const userData = useUserData()
  const [error, setError] = useState()
  const [loans, setLoans] = useState()
  const [givenLoan, setGivenLoan] = useState()
  const [takenLoan, setTakenLoan] = useState()

  const refreshLoansList = useCallback(() => {
    api
      .get('/v1/loans')
      .then(res => {
        setLoans(res.loans)
        setGivenLoan(res.given_loan)
        setTakenLoan(res.taken_loan)
      })
      .catch(err => {
        setError(err.message)
      })
  }, [])
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

  useEffect(() => {
    refreshLoansList()
  }, [refreshLoansList])

  if (error) return <div>{error}</div>
  if (!loans) return <div>Cargando</div>

  let givenLoanElm = null
  if (givenLoan) {
    const remainingSeconds =
      givenLoan.loan_started_at + 60 * 60 * 24 * LOAN_DAYS_DURATION - Math.floor(Date.now() / 1000)
    const remainingTime = Math.ceil(remainingSeconds / (60 * 60 * 24))
    givenLoanElm = (
      <div>
        Has dado un préstamo.
        {givenLoan.borrower ? (
          <> Quedan {remainingTime} días</>
        ) : (
          <button type="button" onClick={cancelLoan}>
            Cancelar préstamo
          </button>
        )}
      </div>
    )
  } else {
    givenLoanElm = <GiveLoan refreshLoansList={refreshLoansList} />
  }

  let takenLoanElm = null
  if (takenLoan) {
    const remainingSeconds =
      takenLoan.loan_started_at + 60 * 60 * 24 * LOAN_DAYS_DURATION - Math.floor(Date.now() / 1000)
    const remainingTime = Math.ceil(remainingSeconds / (60 * 60 * 24))
    takenLoanElm = (
      <>
        <div>Has pedido un préstamo. Quedan {remainingTime} días</div>
      </>
    )
  }
  let loansListElm = loans.length ? (
    loans.map(loan => {
      const isMine = loan.lender.id === userData.id

      return (
        <div key={loan.lender.id}>
          <Username user={loan.lender} />
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
          <hr />
        </div>
      )
    })
  ) : (
    <div>No hay préstamos disponibles</div>
  )

  return (
    <div>
      {givenLoanElm}
      <hr />
      {takenLoanElm}
      <hr />
      {loansListElm}
    </div>
  )
}
