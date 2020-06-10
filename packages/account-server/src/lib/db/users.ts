import mysql from '../mysql'

interface BasicAccountData {
  id: number
  username: string
  avatar: string
  avatarID: number
  gold: number
  level: number
  xp: number
  levelUpXP: number
}

export function avatarIDToUrl(avatar: number): string {
  return `https://avatars.fra1.cdn.digitaloceanspaces.com/${avatar}.jpg`
}

function calculateLevelUpXP(currentLevel: number): number {
  return 2 * currentLevel
}

export async function getData(userID?: number): Promise<BasicAccountData | undefined> {
  if (!userID) return
  const accountData = await mysql.selectOne('SELECT username, avatar, gold, level, xp FROM users WHERE id=?', [userID])
  if (!accountData) return

  if (!accountData.avatar) accountData.avatar = 1
  const avatar = avatarIDToUrl(accountData.avatar)

  return {
    id: userID,
    username: accountData.username,
    avatarID: accountData.avatar,
    avatar,
    gold: accountData.gold,
    level: accountData.level,
    xp: accountData.xp,
    levelUpXP: calculateLevelUpXP(accountData.level),
  }
}

export async function getIDFromUsername(username: string): Promise<number | null> {
  const accountData = await mysql.selectOne('SELECT id FROM users WHERE username=?', [username])
  return accountData ? parseInt(accountData.id) : null
}

export async function giveGoldToUser(userID: number, gold: number): Promise<void> {
  await mysql.query('UPDATE users SET gold=gold+? WHERE id=?', [gold, userID])
}

export async function giveXPToUser(userID: number, xp: number): Promise<void> {
  const userData = await getData(userID)
  if (!userData) return

  let newXP = userData.xp + xp
  let xpNeeded = userData.levelUpXP
  let levelsUp = 0
  let levelUpGoldReward = 0
  while (newXP >= xpNeeded) {
    newXP -= xpNeeded
    levelsUp++
    levelUpGoldReward += 1 + Math.floor((userData.level + levelsUp) / 2)
    xpNeeded = calculateLevelUpXP(userData.level + levelsUp)
  }
  if (levelUpGoldReward) await giveGoldToUser(userID, levelUpGoldReward)
  await mysql.query('UPDATE users SET xp=?, level=? WHERE id=?', [newXP, userData.level + levelsUp, userID])
}

export const getUserList = async (): Promise<Array<BasicAccountData>> => {
  const userList = await mysql.query('SELECT id, username, email, ')
  return userList
}
