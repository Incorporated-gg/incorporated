import mysql from '../lib/mysql'
const users = require('../lib/db/users')

async function parseLoan(loan) {
  ;[loan.lender, loan.borrower] = await Promise.all([users.getData(loan.lender_id), users.getData(loan.borrower_id)])
  delete loan.lender_id
  delete loan.borrower_id
  return loan
}

module.exports = app => {
  app.get('/v1/loans', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    let loans = await mysql.query(
      'SELECT created_at, lender_id, interest_rate, money_amount FROM loans WHERE borrower_id IS NULL ORDER BY money_amount DESC'
    )
    loans = await Promise.all(loans.map(parseLoan))

    let takenLoan = null
    let givenLoan = null
    const myLoans = await mysql.query(
      'SELECT created_at, lender_id, interest_rate, money_amount, borrower_id, loan_started_at FROM loans WHERE borrower_id=? OR lender_id=?',
      [req.userData.id, req.userData.id]
    )
    await Promise.all(
      myLoans.map(async loan => {
        const parsedLoan = await parseLoan(loan)
        if (parsedLoan.lender.id === req.userData.id) givenLoan = loan
        else takenLoan = loan
      })
    )

    res.json({
      loans,
      taken_loan: takenLoan,
      given_loan: givenLoan,
    })
  })

  app.post('/v1/loans/create', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const lenderID = req.userData.id
    const interestRate = parseInt(req.body.interest_rate)
    const moneyAmount = parseInt(req.body.money_amount)

    const MAX_INTEREST_RATE = 50
    const MIN_INTEREST_RATE = 5
    if (Number.isNaN(interestRate) || interestRate < MIN_INTEREST_RATE || interestRate > MAX_INTEREST_RATE) {
      res.status(400).json({ error: 'Interés inválido' })
      return
    }

    const MIN_AMOUNT = 1000
    if (Number.isNaN(moneyAmount) || moneyAmount < MIN_AMOUNT) {
      res.status(400).json({ error: `Cantidad de dinero inválida (Mínimo: ${MIN_AMOUNT.toLocaleString()})` })
      return
    }

    if (moneyAmount > req.userData.money) {
      res.status(400).json({ error: 'No tienes suficiente dinero' })
      return
    }

    const [userHasLoan] = await mysql.query('SELECT 1 FROM loans WHERE lender_id=?', [lenderID])
    if (userHasLoan) {
      res.status(400).json({ error: 'Ya tienes un préstamo activo' })
      return
    }

    const lenderIncome = await users.getUserDailyIncome(lenderID)
    const loanIncomeRatio = moneyAmount / lenderIncome
    if (loanIncomeRatio > 4) {
      res.status(400).json({ error: 'Necesitas más ingresos para anunciar este préstamo' })
      return
    }

    await mysql.query('UPDATE users SET money=money-? WHERE id=?', [moneyAmount, lenderID])
    const tsNow = Math.floor(Date.now() / 1000)
    await mysql.query('INSERT INTO loans (created_at, lender_id, interest_rate, money_amount) VALUES (?, ?, ?, ?)', [
      tsNow,
      lenderID,
      interestRate,
      moneyAmount,
    ])

    res.json({
      success: true,
    })
  })

  app.post('/v1/loans/take', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const lenderID = parseInt(req.body.lender_id)
    const borrowerID = req.userData.id

    if (lenderID === borrowerID) {
      res.status(400).json({ error: 'No puedes pedir tu propio préstamo' })
      return
    }

    const [userHasLoan] = await mysql.query('SELECT 1 FROM loans WHERE borrower_id=?', [borrowerID])
    if (userHasLoan) {
      res.status(400).json({ error: 'Ya tienes un préstamo activo' })
      return
    }

    const [
      loanData,
    ] = await mysql.query('SELECT money_amount, interest_rate FROM loans WHERE lender_id=? AND borrower_id IS NULL', [
      lenderID,
    ])
    if (!loanData) {
      res.status(400).json({ error: 'Este préstamo no existe' })
      return
    }

    const borrower = await users.getData(borrowerID)
    const loanIncomeRatio = loanData.money_amount / borrower.income
    if (loanIncomeRatio > 4) {
      res.status(400).json({ error: 'Necesitas más ingresos para pedir este préstamo' })
      return
    }

    await mysql.query('UPDATE users SET money=money+? WHERE id=?', [loanData.money_amount, borrowerID])
    const tsNow = Math.floor(Date.now() / 1000)
    await mysql.query('UPDATE loans SET borrower_id=?, loan_started_at=? WHERE lender_id=?', [
      borrowerID,
      tsNow,
      lenderID,
    ])

    // Send messages
    const msgData = {
      borrower_id: borrowerID,
      lender_id: lenderID,
      money_amount: loanData.money_amount,
      interest_rate: loanData.interest_rate,
    }
    await users.sendMessage({
      receiverID: borrowerID,
      senderID: null,
      type: 'loan_started',
      data: msgData,
    })
    await users.sendMessage({
      receiverID: lenderID,
      senderID: null,
      type: 'loan_started',
      data: msgData,
    })

    res.json({
      success: true,
    })
  })

  app.post('/v1/loans/cancel', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    const lenderID = req.userData.id

    const [userLoan] = await mysql.query('SELECT money_amount FROM loans WHERE lender_id=? AND borrower_id IS NULL', [
      lenderID,
    ])

    if (!userLoan) {
      res.status(400).json({ error: 'No tienes un préstamo disponible' })
      return
    }

    await mysql.query('UPDATE users SET money=money+? WHERE id=?', [userLoan.money_amount, lenderID])
    await mysql.query('DELETE FROM loans WHERE lender_id=?', [lenderID])

    res.json({
      success: true,
    })
  })
}
