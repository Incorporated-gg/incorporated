const mysql = require('../lib/mysql')

module.exports = app => {
  app.post('/v1/declare_bankruptcy', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    if (req.userData.money > 0) {
      res.status(400).json({ error: 'Solo puedes declarar bancarrota con dinero en negativo' })
      return
    }

    const tsNow = Math.floor(Date.now() / 1000)

    const [
      [{ last_bankrupcy_at: lastBankrupcyAt }],
    ] = await mysql.query('SELECT last_bankrupcy_at FROM users WHERE id=?', [req.userData.id])
    if (lastBankrupcyAt && tsNow - lastBankrupcyAt < 60 * 60 * 24 * 7) {
      res.status(400).json({ error: 'Solo puedes declarar bancarrota una vez por semana' })
      return
    }

    await mysql.query(
      'UPDATE users_resources SET quantity=0 WHERE resource_id IN ("thieves", "guards", "sabots", "spies") AND user_id=?',
      [req.userData.id]
    )
    await mysql.query('UPDATE users SET last_bankrupcy_at=? WHERE id=?', [tsNow, req.userData.id])

    res.json({
      success: true,
    })
  })
}
