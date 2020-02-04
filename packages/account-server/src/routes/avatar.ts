import express from 'express'
import mysql from '../lib/mysql'
import { avatarIDToUrl } from '../lib/db/users'

async function getUserAvailableAvatars(): Promise<number[]> {
  const avatarList = [1, 2, 3, 4, 5]
  return avatarList
}

export default (app: express.Application): void => {
  app.get('/v1/avatar/list', async function(req, res) {
    if (!req.accountData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    const avatarList = await getUserAvailableAvatars()

    res.json({
      avatarList: avatarList.map(avatarID => ({
        id: avatarID,
        url: avatarIDToUrl(avatarID),
      })),
    })
  })

  app.post('/v1/avatar/change', async function(req, res) {
    if (!req.accountData) {
      res.status(401).json({ error: 'Necesitas estar conectado', errorCode: 'not_logged_in' })
      return
    }

    const newAvatarID = req.body.avatarID

    const avatarList = await getUserAvailableAvatars()
    if (avatarList.indexOf(newAvatarID) === -1) {
      res.status(401).json({ error: 'Avatar inválido' })
      return
    }

    await mysql.query('UPDATE users SET avatar=? WHERE id=?', [newAvatarID, req.accountData.id])

    res.json({
      success: true,
    })
  })
}
