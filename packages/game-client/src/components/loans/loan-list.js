import React from 'react'
import PropTypes from 'prop-types'
import LoanListItem from './loan-list-item'
import styles from './loans.module.scss'
import Container from 'components/UI/container'

LoanList.propTypes = {
  loans: PropTypes.array.isRequired,
  refreshLoansList: PropTypes.func.isRequired,
}
export default function LoanList({ loans, refreshLoansList }) {
  return (
    <Container darkBg>
      <div className={styles.contentContainer}>
        <div className={styles.title}>PRÉSTAMOS</div>
        {loans.length ? (
          loans.map((loan, i) => <LoanListItem loan={loan} refreshLoansList={refreshLoansList} key={i} />)
        ) : (
          <div>No hay préstamos disponibles</div>
        )}
      </div>
    </Container>
  )
}
