import React, { useState } from 'react'
import api from '../../lib/api'
import PropTypes from 'prop-types'

const LOAN_DAYS_DURATION = 7
Loans.propTypes = {
  refreshLoansList: PropTypes.func.isRequired,
}
export default function Loans({ refreshLoansList }) {
  const [moneyAmount, setMoneyAmount] = useState(0)
  const [interestRate, setInterestRate] = useState(15)

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

  return (
    <div>
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
  )
}
