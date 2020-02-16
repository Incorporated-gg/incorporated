import React, { useEffect, useState, useCallback } from 'react'
import { get } from 'lib/api'
import CreateLoan from 'components/loans/create-loan'
import LoanList from 'components/loans/loan-list'
import TakenLoan from 'components/loans/taken-loan'

export default function Loans() {
  const [error, setError] = useState(null)
  const [loans, setLoans] = useState([])
  const [givenLoan, setGivenLoan] = useState(null)
  const [takenLoan, setTakenLoan] = useState(null)

  const refreshLoansList = useCallback(() => {
    get('/v1/loans')
      .then(res => {
        setLoans(res.loans)
        setGivenLoan(res.given_loan)
        setTakenLoan(res.taken_loan)
      })
      .catch(err => {
        setError(err.message)
      })
  }, [])

  useEffect(() => {
    refreshLoansList()
  }, [refreshLoansList])

  if (error) return <div>{error}</div>
  if (!loans) return <div>Cargando...</div>

  return (
    <div>
      <CreateLoan givenLoan={givenLoan} refreshLoansList={refreshLoansList} />
      <hr />
      {takenLoan && <TakenLoan takenLoan={takenLoan} />}
      <hr />
      <LoanList loans={loans} refreshLoansList={refreshLoansList} />
    </div>
  )
}
