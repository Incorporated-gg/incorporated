import { Application } from 'express'
import { validateIsAdmin } from './'
import mysql from '../../lib/mysql'

export default (app: Application): void => {
  app.get('/v1/admin/users/list', validateIsAdmin, async function(req, res) {
    const users = await mysql.query('SELECT id, username FROM users')
    res.json(users)
  })
  app.get('/v1/admin/user/:userId', validateIsAdmin, async function(req, res) {
    const [user] = await mysql.query('SELECT * FROM users WHERE id = ?', [req.params.userId])
    res.json(user)
  })
}
