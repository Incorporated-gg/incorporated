const mysql = require('../lib/mysql')
const { personnelList } = require('shared-lib/personnelUtils')

const handlePersonnelRequest = async (req, res, operationType) => {
  if (!req.userData) {
    res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
    return
  }
  if (!req.body.amount || !req.body.resource_id) {
    res.status(400).json({ error: 'Faltan datos' })
    return
  }

  const resourceAmount = req.body.amount
  const resourceID = req.body.resource_id
  const count = 1 // TODO: Use req.body.count
  if (count > 1) throw new Error('Not implemented yet')

  if (!personnelList.find(b => b.resource_id === resourceID)) {
    res.status(400).json({ error: 'Invalid resource_id' })
    return
  }

  if (resourceAmount < 1) {
    res.status(400).json({ error: 'Invalid resource amount' })
    return
  }

  const [
    [curPersonnelAmount],
  ] = await mysql.query('SELECT quantity FROM users_resources WHERE user_id=? and resource_id=?', [
    req.userData.id,
    resourceID,
  ])

  let price
  switch (operationType) {
    case 'hire':
      price = personnelList.find(resources => resources.resource_id === resourceID).price * resourceAmount
      break
    case 'fire':
      if (!curPersonnelAmount || (curPersonnelAmount && curPersonnelAmount.quantity < resourceAmount)) {
        res.status(400).json({ error: 'No tienes suficiente personal' })
        return
      }
      price = personnelList.find(resources => resources.resource_id === resourceID).firingCost * resourceAmount
      break
    default:
      res.status(500).json({ error: 'No implementado' })
      return
  }

  if (price > req.userData.money) {
    res.status(400).json({ error: 'No tienes suficiente dinero' })
    return
  }

  req.userData.money -= price
  if (operationType === 'hire') {
    req.userData.personnel[resourceID] += resourceAmount
  } else if (operationType === 'fire') {
    req.userData.personnel[resourceID] -= resourceAmount
  }
  await mysql.query('UPDATE users SET money=money-? WHERE id=?', [price, req.userData.id])

  if (!curPersonnelAmount) {
    await mysql.query('INSERT INTO users_resources (user_id, resource_id, quantity) VALUES (?, ?, ?)', [
      req.userData.id,
      resourceID,
      resourceAmount,
    ])
  } else {
    if (operationType === 'hire') {
      await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? and resource_id=?', [
        resourceAmount,
        req.userData.id,
        resourceID,
      ])
    } else if (operationType === 'fire') {
      await mysql.query('UPDATE users_resources SET quantity=quantity-? WHERE user_id=? and resource_id=?', [
        resourceAmount,
        req.userData.id,
        resourceID,
      ])
    }
  }

  res.json({
    success: true,
  })
}

module.exports = app => {
  app.get('/v1/personnel', async function(req, res) {
    if (!req.userData) {
      res.status(401).json({ error: 'Necesitas estar conectado', error_code: 'not_logged_in' })
      return
    }
    res.json({
      personnel: req.userData.personnel,
    })
  })

  app.post('/v1/personnel/hire', async function(req, res) {
    handlePersonnelRequest(req, res, 'hire')
  })

  app.post('/v1/personnel/fire', async function(req, res) {
    handlePersonnelRequest(req, res, 'fire')
  })
}
