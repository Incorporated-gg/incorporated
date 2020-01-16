const mysql = require('../lib/mysql')
const frequencyMs = 60 * 1000

const LOAN_DAYS_DURATION = 7
const run = async () => {
  const tsNow = Math.floor(Date.now() / 1000)
  const [loans] = await mysql.query(
    'SELECT created_at, lender_id, interest_rate, money_amount, borrower_id, loan_started_at FROM loans WHERE borrower_id IS NOT NULL'
  )
  await Promise.all(
    loans.map(async loan => {
      // Loan end
      if (tsNow - loan.loan_started_at > 60 * 60 * 24 * LOAN_DAYS_DURATION) {
        await mysql.query('DELETE FROM loans WHERE borrower_id=?', [loan.borrower_id])
        return
      }
      // Money exchange
      const moneyExchange =
        ((loan.money_amount * (loan.interest_rate / 100 + 1)) / LOAN_DAYS_DURATION / (24 * 60 * 60 * 1000)) *
        frequencyMs
      await mysql.query('UPDATE users SET money=money+? WHERE id=?', [moneyExchange, loan.lender_id])
      await mysql.query('UPDATE users SET money=money-? WHERE id=?', [moneyExchange, loan.borrower_id])
    })
  )
}

module.exports = {
  run,
  frequencyMs,
}
