import mysql from '../lib/mysql'
import { getAllianceBasicData } from '../lib/db/alliances'
import { getUserData } from '../lib/db/users'

module.exports = app => {
  app.get('/v1/search', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    if (typeof req.query.username !== 'string' || req.query.username.length < 3) {
      res.status(400).json({ error: 'Usa al menos 3 caracteres para la búsqueda' })
      return
    }

    let users = await mysql.query(
      'SELECT users.id FROM users JOIN ranking_income ON ranking_income.user_id = users.id WHERE users.username LIKE ? ORDER BY ranking_income.rank LIMIT 20',
      [`%${req.query.username}%`]
    )

    users = await Promise.all(users.map(u => getUserData(u.id)))

    res.json({
      users,
    })
  })

  app.get('/v1/search/alliance', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }

    if (typeof req.query.query !== 'string' || req.query.query.length < 2) {
      res.status(400).json({ error: 'Usa al menos 2 caracteres para la búsqueda' })
      return
    }

    let alliances = await mysql.query(
      'SELECT alliances.id FROM alliances JOIN ranking_alliances ON ranking_alliances.alliance_id = alliances.id WHERE alliances.short_name LIKE ? OR alliances.long_name LIKE ? ORDER BY ranking_alliances.rank LIMIT 20',
      [`%${req.query.query}%`, `%${req.query.query}%`]
    )

    alliances = await Promise.all(alliances.map(a => getAllianceBasicData(a.id)))

    res.json({
      alliances,
    })
  })
}
