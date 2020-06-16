import mysql from '../mysql'
import { Request } from 'express'
import { getUsernameFromID } from './users'
import {
  ActivityTrailType,
  ActivityTrailData,
  ActivityTrailDataForFrontend,
  UserDataForFrontend,
} from 'shared-lib/activityTrailUtils'

interface DBActivityTrailData {
  user_id: number
  date: string
  ip: string
  type: ActivityTrailType
  message?: string
  extra?: string
}

interface DBMultiAccountData {
  user_id: number
  ip: string
}

interface MultiAccountDataForFrontend extends UserDataForFrontend {
  ip: string
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const userColors = new Map()
const usernames = new Map()

const getUniqueUserIds = (activities: Array<{ user_id: number }>): Array<number> => {
  return activities.filter((a, i, array) => array.findIndex(el => el.user_id === a.user_id) === i).map(u => u.user_id)
}

const prefetchUsernamesForIds = async (ids: Array<number>): Promise<void> => {
  await Promise.all(
    ids.map(async uid => {
      let un = usernames.get(uid)
      if (!un) {
        un = await getUsernameFromID(uid)
        usernames.set(uid, un)
      }
      if (!un) un = '<Username Desconocido>'
      return un
    })
  )
}

export const getLatestActivityLogs = async (limit = 10): Promise<Array<ActivityTrailDataForFrontend>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query(
    'SELECT * FROM users_activity_log ORDER BY date DESC LIMIT ?',
    [limit]
  )
  await prefetchUsernamesForIds(getUniqueUserIds(activities))
  const mappedActivities: Array<ActivityTrailDataForFrontend> = activities.map(activity => {
    let extra = activity.extra
    try {
      extra = activity.extra ? JSON.parse(activity.extra) : activity.extra
    } catch (error) {
      console.error(error)
    }
    return {
      date: parseInt(activity.date),
      ip: activity.ip,
      type: activity.type,
      userId: activity.user_id,
      extra,
      message: activity.message,
      user: {
        username: usernames.get(activity.user_id),
        userColor:
          userColors.get(activity.user_id) ||
          ((): string => {
            const c = getRandomColor()
            userColors.set(activity.user_id, c)
            return c
          })(),
        userId: activity.user_id,
      },
    }
  })
  return mappedActivities.sort((act1, act2) => act2.date - act1.date)
}

export const getUserActivityLogs = async (userId: number): Promise<Array<ActivityTrailData>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query(
    'SELECT * FROM users_activity_log WHERE user_id = ? ORDER BY date DESC LIMIT 200',
    [userId]
  )
  await prefetchUsernamesForIds(getUniqueUserIds(activities))
  const mappedActivities: Array<ActivityTrailDataForFrontend> = activities.map(activity => {
    let extra = activity.extra
    try {
      extra = activity.extra ? JSON.parse(activity.extra) : activity.extra
    } catch (error) {
      console.error(error)
    }
    return {
      date: parseInt(activity.date),
      ip: activity.ip,
      type: activity.type,
      userId: activity.user_id,
      extra,
      message: activity.message,
      user: {
        username: usernames.get(activity.user_id),
        userColor:
          userColors.get(activity.user_id) ||
          ((): string => {
            const c = getRandomColor()
            userColors.set(activity.user_id, c)
            return c
          })(),
        userId: activity.user_id,
      },
    }
  })
  return mappedActivities.sort((act1, act2) => act2.date - act1.date)
}

export const getActiveUsersForLastDaysCount = async (days = 30): Promise<number> => {
  const targetDate = Date.now() - days * 1000 * 60 * 60 * 24
  const [
    { activeUsers },
  ] = await mysql.query('SELECT COUNT(DISTINCT user_id) AS activeUsers FROM users_activity_log WHERE date >= ?', [
    targetDate,
  ])
  return activeUsers
}

export const getMultiAccounts = async (): Promise<Array<MultiAccountDataForFrontend>> => {
  const ipUserList: Array<DBMultiAccountData> = await mysql.query(
    'SELECT user_id, ip FROM users_activity_log WHERE ip != "internal" AND ip != "::ffff:127.0.0.1" GROUP BY ip, user_id ORDER BY ip'
  )
  await prefetchUsernamesForIds(getUniqueUserIds(ipUserList))
  // Data should already pass this filter below straight from the DB
  // Remove if necessary
  const multis = ipUserList
    .map(user => {
      const hasMulti = ipUserList.find(u => u.ip === user.ip && u.user_id !== user.user_id)
      if (hasMulti) return user
      return null
    })
    .filter(Boolean) as DBMultiAccountData[]

  return multis.map(multiAccount => {
    return {
      userColor:
        userColors.get(multiAccount.user_id) ||
        ((): string => {
          const c = getRandomColor()
          userColors.set(multiAccount.user_id, c)
          return c
        })(),
      userId: multiAccount.user_id,
      username: usernames.get(multiAccount.user_id),
      ip: multiAccount.ip,
    }
  })
}

export const getTopActiveUsersForLastDays = async (days = 30): Promise<number> => {
  const targetDate = Date.now() - days * 1000 * 60 * 60 * 24
  const [
    { activeUsers },
  ] = await mysql.query('SELECT COUNT(DISTINCT user_id) AS activeUsers FROM users_activity_log WHERE date >= ?', [
    targetDate,
  ])
  return activeUsers
}

export const getUniqueUserIpsForLastDays = async (days = 30): Promise<number> => {
  const targetDate = Date.now() - days * 1000 * 60 * 60 * 24
  const [
    { uniqueIps },
  ] = await mysql.query(
    'SELECT COUNT(DISTINCT ip) AS uniqueIps FROM users_activity_log WHERE ip != "internal" AND date >= ?',
    [targetDate]
  )
  return uniqueIps
}

export const logUserActivity = async (activityData: ActivityTrailData): Promise<void> => {
  await mysql.query(
    'INSERT INTO users_activity_log (user_id, date, ip, type, message, extra) VALUES (?, ?, ?, ?, ?, ?)',
    [
      activityData.userId,
      activityData.date,
      activityData.ip,
      activityData.type,
      activityData.message,
      activityData.extra,
    ]
  )
}

export const getIpFromRequest = (request: Request): string => {
  const cloudflareClientIp = request.headers['cf-connecting-ip']?.toString()
  return cloudflareClientIp || request.ip
}
