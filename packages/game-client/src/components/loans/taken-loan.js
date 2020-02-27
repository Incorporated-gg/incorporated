import React from 'react'
import PropTypes from 'prop-types'
import { LOAN_DAYS_DURATION } from 'shared-lib/loansUtils'
import Container from 'components/UI/container'

TakenLoan.propTypes = {
  takenLoan: PropTypes.object.isRequired,
}
export default function TakenLoan({ takenLoan }) {
  const remainingSeconds = takenLoan.loan_started_at + 60 * 60 * 24 * LOAN_DAYS_DURATION - Math.floor(Date.now() / 1000)
  const remainingTime = Math.ceil(remainingSeconds / (60 * 60 * 24))
  return (
    <Container>
      <div style={{ background: '#FFF8E6', padding: 7 }}>Has pedido un préstamo. Quedan {remainingTime} días</div>
    </Container>
  )
}
