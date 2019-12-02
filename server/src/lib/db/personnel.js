const mysql = require('../mysql')

module.exports.updatePersonnelAmount = updatePersonnelAmount
async function updatePersonnelAmount(req, resourceID, resourceAmount) {
  let personnelRowExists = true
  if (req.userData.personnel[resourceID] === 0) {
    ;[[personnelRowExists]] = await mysql.query('SELECT 1 FROM users_resources WHERE user_id=? AND resource_id=?', [
      req.userData.id,
      resourceID,
    ])
  }

  req.userData.personnel[resourceID] += resourceAmount
  if (!personnelRowExists) {
    await mysql.query('INSERT INTO users_resources (user_id, resource_id, quantity) VALUES (?, ?, ?)', [
      req.userData.id,
      resourceID,
      resourceAmount,
    ])
  } else {
    await mysql.query('UPDATE users_resources SET quantity=quantity+? WHERE user_id=? and resource_id=?', [
      resourceAmount,
      req.userData.id,
      resourceID,
    ])
  }
}
