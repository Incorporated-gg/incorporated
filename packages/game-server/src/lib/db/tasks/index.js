import mysql from '../../mysql'
import { getUserResearchs, getUserDailyIncome } from '../users'
import generateTasksList from './generateTaskList'
import { getUserAllianceID } from '../alliances'

const tasks = generateTasksList()

export async function getUserActiveTasks(userID) {
  const userTaskData = await getUserTaskData(userID)

  const MAX_CONCURRENT_TASKS = 3
  const missingTasks = tasks
    .filter(task => userTaskData.completed.indexOf(task.id) === -1)
    .slice(0, MAX_CONCURRENT_TASKS)

  return await Promise.all(
    missingTasks.map(async taskInfo => {
      const progressPercentage = await getTaskCompletionPercentage(userID, taskInfo, userTaskData[`task${taskInfo.id}`])

      return {
        ...taskInfo,
        progressPercentage: progressPercentage,
      }
    })
  )
}

export async function completeTask(userID, taskID) {
  const activeTasks = await getUserActiveTasks(userID)
  const activeTask = activeTasks.find(t => t.id === taskID)
  if (!activeTask) return // No active task found with that ID
  if (activeTask.progressPercentage < 100) return // Not completed :(

  const userTaskData = await getUserTaskData(userID)
  delete userTaskData[`task${activeTask.id}`]
  const newTaskData = { ...userTaskData, completed: [...userTaskData.completed, taskID] }
  await mysql.query('UPDATE users SET task_data=? WHERE id=?', [JSON.stringify(newTaskData), userID])

  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [activeTask.reward, userID])

  return {
    moneyReward: activeTask.reward,
  }
}

export async function getUserTaskData(userID) {
  const rawTaskData = await mysql.selectOne('SELECT task_data FROM users WHERE id=?', [userID])
  if (!rawTaskData.task_data) return { completed: [] }
  return JSON.parse(rawTaskData.task_data)
}

async function getTaskCompletionPercentage(userID, taskInfo, taskData) {
  if (!taskData) taskData = {}
  let progress = 0

  switch (taskInfo.type) {
    case 'cyclic_build':
    case 'cyclic_attack':
    case 'cyclic_research':
    case 'cyclic_rob':
    case 'cyclic_income':
    case 'custom_extract_money': {
      if (!taskData.count) taskData.count = 0
      progress = (taskData.count / taskInfo.requirements.amount) * 100
      break
    }
    case 'barrier_income': {
      const neededDailyIncome = taskInfo.requirements.amount
      const userDailyIncome = await getUserDailyIncome(userID)
      progress = (userDailyIncome / neededDailyIncome) * 100
      break
    }
    case 'barrier_research': {
      const researchLevelsNeeded = taskInfo.requirements.amount
      const userResearchs = await getUserResearchs(userID)
      const totalResearchLevel = Object.values(userResearchs).reduce((prev, curr) => prev + curr, 0)
      progress = (totalResearchLevel / researchLevelsNeeded) * 100
      break
    }
    case 'barrier_centraloffice': {
      const CENTRAL_OFFICE_RESEARCH_ID = 5
      progress = await researchLevelRequirement(userID, taskInfo.requirements.amount, CENTRAL_OFFICE_RESEARCH_ID)
      break
    }
    case 'custom_bank': {
      const BANK_RESEARCH_ID = 4
      progress = await researchLevelRequirement(userID, taskInfo.requirements.amount, BANK_RESEARCH_ID)
      break
    }
    case 'custom_join_alliance': {
      const userAlliance = await getUserAllianceID(userID)
      progress = userAlliance ? 100 : 0
      break
    }
  }
  return Math.min(Math.floor(progress), 100)
}

async function researchLevelRequirement(userID, amountNeeded, researchID) {
  const researchObjectiveLevel = amountNeeded
  const userResearchs = await getUserResearchs(userID)
  const researchLevel = userResearchs[researchID]
  const progress = (researchLevel / researchObjectiveLevel) * 100
  return progress
}
