import mysql from '../mysql'

export enum ActivityTrailType {
  ATTACK_START = 'attackStart',
  ATTACK_CANCEL = 'attackCancel',
  ATTACK_FINISH = 'attackFinish',
  SPY_START = 'spyStart',
  SPY_CANCEL = 'spyCancel',
  SPY_FINISH = 'spyFinish',
  LOGIN = 'login',
  CORP_CREATE = 'corpCreate',
  CORP_DELETE = 'corpDelete',
  CORP_LEAVE = 'corpLeave',
  CORP_BUFF = 'corpBuff',
  CORP_REQUEST = 'corpRequest',
  CORP_KICK = 'corpKick',
  CORP_REJECT = 'corpReject',
  CORP_ACCEPT = 'corpAccept',
  CORP_DEPOSIT = 'corpDeposit',
  CORP_WITHDRAW = 'corpWithdraw',
  CORP_INVEST = 'corpInvest',
  BUILDING_BOUGHT = 'buildingBought',
  BUILDING_EXTRACT = 'buildingExtract',
  RESEARCH_START = 'researchStart',
  RESEARCH_MANUALLY_ENDED = 'researchManuallyEnded',
  RESEARCH_END = 'researchEnd',
  PERSONNEL_HIRED = 'personnelHired',
  PERSONNEL_FIRED = 'personnelFired',
}

export interface DBActivityTrailData {
  user_id: number
  date: string
  ip: string
  type: ActivityTrailType
  message?: string
  extra?: string
}

export interface ActivityTrailData {
  userId: number
  date: number
  ip: string
  type: ActivityTrailType
  message?: string
  extra?: string
}

export const getUserActivityForPeriod = (
  userId: number,
  periodStart: number,
  periodEnd: number
): Array<ActivityTrailData> => {
  return [
    {
      date: Date.now(),
      ip: '0.0.0.0',
      message: 'Test message',
      userId,
      type: ActivityTrailType.CORP_DEPOSIT,
    },
  ]
}

export const getLatestActivityLogs = async (limit = 10): Promise<Array<ActivityTrailData>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query('SELECT * FROM users_activity_log LIMIT ?', [limit])
  const mappedActivities: Array<ActivityTrailData> = activities
    .map(activity => {
      const newActivity: ActivityTrailData = {
        date: parseInt(activity.date),
        ip: activity.ip,
        type: activity.type,
        userId: activity.user_id,
        extra: activity.extra ? JSON.parse(activity.extra) : null,
        message: activity.message,
      }
      return newActivity
    })
    .sort((act1, act2) => act2.date - act1.date)
  return mappedActivities
}

export const getUserActivityLogs = async (userId: number): Promise<Array<ActivityTrailData>> => {
  const activities: Array<DBActivityTrailData> = await mysql.query(
    'SELECT * FROM users_activity_log WHERE user_id = ?',
    [userId]
  )
  const mappedActivities: Array<ActivityTrailData> = activities
    .map(activity => {
      const newActivity: ActivityTrailData = {
        date: parseInt(activity.date),
        ip: activity.ip,
        type: activity.type,
        userId: activity.user_id,
        extra: activity.extra ? JSON.parse(activity.extra) : null,
        message: activity.message,
      }
      return newActivity
    })
    .sort((act1, act2) => act2.date - act1.date)
  return mappedActivities
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
