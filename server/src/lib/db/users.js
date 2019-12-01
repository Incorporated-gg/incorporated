const mysql = require('../mysql')
const alliances = require('./alliances')

module.exports.getData = async userID => {
  const userDataPromise = mysql.query('SELECT username FROM users WHERE id=?', [userID])
  const rankingDataPromise = mysql.query('SELECT rank, income FROM ranking WHERE user_id=?', [userID])
  const alliancePromise = alliances.getUserAllianceID(userID).then(alliances.getBasicData)
  const [[[userData]], [[rankingData]], allianceData] = await Promise.all([
    userDataPromise,
    rankingDataPromise,
    alliancePromise,
  ])
  if (!userData) return false

  return {
    id: userID,
    username: userData.username,
    rank_position: rankingData ? rankingData.rank : 0,
    income: rankingData ? rankingData.income : 0,
    alliance: allianceData,
  }
}
