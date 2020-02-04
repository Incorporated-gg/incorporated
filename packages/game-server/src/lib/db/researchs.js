import mysql from '../mysql'

export async function getActiveResearchs(userID) {
  const activeResearchs = await mysql.query('SELECT research_id, finishes_at FROM research_active WHERE user_id=?', [
    userID,
  ])
  return activeResearchs
}

export async function upgradeUserResearch(userID, researchID) {
  const researchRowExists = await mysql.selectOne('SELECT 1 FROM research WHERE user_id=? and id=?', [
    userID,
    researchID,
  ])
  if (!researchRowExists) {
    await mysql.query('INSERT INTO research (user_id, id, level) VALUES (?, ?, ?)', [userID, researchID, 2])
  } else {
    await mysql.query('UPDATE research SET level=level+? WHERE user_id=? and id=?', [1, userID, researchID])
  }
}
