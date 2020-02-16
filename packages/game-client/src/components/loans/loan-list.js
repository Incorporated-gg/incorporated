import React from 'react'
import PropTypes from 'prop-types'
import LoanListItem from './loan-list-item'

LoanList.propTypes = {
  loans: PropTypes.array.isRequired,
  refreshLoansList: PropTypes.func.isRequired,
}
export default function LoanList({ loans, refreshLoansList }) {
  return loans.length ? (
    loans.map((loan, i) => <LoanListItem loan={loan} refreshLoansList={refreshLoansList} key={i} />)
  ) : (
    <div>No hay préstamos disponibles</div>
  )
}
