import mysql from '../mysql'

type BasicUserData = {
  id: number
  username: string
}

export async function getData(userID: number): Promise<BasicUserData | null> {
  const userDataPromise = mysql.query('SELECT username FROM users WHERE id=?', [userID])
  const [[userData]] = await Promise.all([userDataPromise])
  if (!userData) return null

  return {
    id: userID,
    username: userData.username,
  }
}

export async function getIDFromUsername(username: string): Promise<BasicUserData | null> {
  const [userData] = await mysql.query('SELECT id FROM users WHERE username=?', [username])
  return userData ? userData.id : null
}
