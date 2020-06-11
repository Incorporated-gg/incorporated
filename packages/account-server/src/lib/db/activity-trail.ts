import mysql from '../mysql'
import { Request } from 'express'
import { getUsernameFromID } from './users'
import { ActivityTrailType, ActivityTrailData, ActivityTrailDataForFrontend } from 'shared-lib/activityTrailUtils'

export interface DBActivityTrailData {
  user_id: number
  date: string
  ip: string
  type: ActivityTrailType
  message?: string
  extra?: string
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

export const getLatestActivityLogs = async (limit = 10): Promise<Array<ActivityTrailDataForFrontend>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query(
    'SELECT * FROM users_activity_log ORDER BY date DESC LIMIT ?',
    [limit]
  )
  const mappedActivities: Array<ActivityTrailDataForFrontend> = await Promise.all(
    await activities.map(async activity => {
      let username = await getUsernameFromID(activity.user_id)
      if (!username) username = '<Username Desconocido>'
      const newActivity: ActivityTrailDataForFrontend = {
        date: parseInt(activity.date),
        ip: activity.ip,
        type: activity.type,
        userId: activity.user_id,
        extra: activity.extra ? JSON.parse(activity.extra) : null,
        message: activity.message,
        username,
        userColor:
          userColors.get(username) ||
          ((): string => {
            const c = getRandomColor()
            userColors.set(username, c)
            return c
          })(),
      }
      return newActivity
    })
  )
  return mappedActivities.sort((act1, act2) => act2.date - act1.date)
}

export const getUserActivityLogs = async (userId: number): Promise<Array<ActivityTrailData>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query(
    'SELECT * FROM users_activity_log WHERE user_id = ? ORDER BY date DESC',
    [userId]
  )
  const mappedActivities: Array<ActivityTrailDataForFrontend> = await Promise.all(
    await activities.map(async activity => {
      let username = await getUsernameFromID(userId)
      if (!username) username = '<Username Desconocido>'
      const newActivity: ActivityTrailDataForFrontend = {
        date: parseInt(activity.date),
        ip: activity.ip,
        type: activity.type,
        userId: activity.user_id,
        extra: activity.extra ? JSON.parse(activity.extra) : null,
        message: activity.message,
        username,
        userColor:
          userColors.get(username) ||
          ((): string => {
            const c = getRandomColor()
            userColors.set(username, c)
            return c
          })(),
      }
      return newActivity
    })
  )
  return mappedActivities.sort((act1, act2) => act2.date - act1.date)
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
  const cloudflareClientIp = request.headers['CF-Connecting-IP']?.toString()
  return cloudflareClientIp || request.ip
}
