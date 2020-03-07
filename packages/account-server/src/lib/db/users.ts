import mysql from '../mysql'

type BasicAccountData = {
  id: number
  username: string
  avatar: string
  avatarID: number
  gold: number
}

export function avatarIDToUrl(avatar: number): string {
  return `https://avatars.fra1.cdn.digitaloceanspaces.com/${avatar}.jpg`
}

export async function getData(userID?: number): Promise<BasicAccountData | undefined> {
  if (!userID) return
  const accountDataPromise = mysql.query('SELECT username, avatar, gold FROM users WHERE id=?', [userID])
  const [[accountData]] = await Promise.all([accountDataPromise])
  if (!accountData) return

  if (!accountData.avatar) accountData.avatar = 1
  const avatar = avatarIDToUrl(accountData.avatar)

  return {
    id: userID,
    username: accountData.username,
    avatarID: accountData.avatar,
    avatar,
    gold: accountData.gold,
  }
}

export async function getIDFromUsername(username: string): Promise<BasicAccountData | undefined> {
  const [accountData] = await mysql.query('SELECT id FROM users WHERE username=?', [username])
  return accountData ? accountData.id : undefined
}

export async function giveGoldToUser(userID: number, gold: number): Promise<void> {
  await mysql.query('UPDATE users SET gold=gold+? WHERE id=?', [gold, userID])
}
