const mysql = require('../mysql')

module.exports.getData = getData
async function getData(userID) {
  const userDataPromise = mysql.query('SELECT username FROM users WHERE id=?', [userID])
  const [[userData]] = await Promise.all([userDataPromise])
  if (!userData) return null

  return {
    id: userID,
    username: userData.username,
  }
}

module.exports.getIDFromUsername = async username => {
  const [userData] = await mysql.query('SELECT id FROM users WHERE username=?', [username])
  return userData ? userData.id : null
}
