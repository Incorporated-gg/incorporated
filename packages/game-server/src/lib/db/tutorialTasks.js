import mysql from '../mysql'
import { getBuildings, getUserResearchs, getUserDailyIncome } from './users'
import { getUserAllianceID } from './alliances'
import { NEWBIE_ZONE_DAILY_INCOME } from 'shared-lib/missionsUtils'

const tasks = {
  1: { id: 1, name: 'Construye 5 zapaterías', reward: 50000 },
  2: { id: 2, name: 'Construye 50 zapaterías', reward: 250000 },
  3: { id: 3, name: 'Mejora Oficina Central al nivel 3', reward: 150000 },
  4: { id: 4, name: 'Construye 20 restaurantes', reward: 150000 },
  5: { id: 5, name: 'Obtén 1.000€ en total, extrayendo dinero de tus edificios', reward: 50000 },
  6: { id: 6, name: 'Sube la investigación Banco al nivel 5 ', reward: 50000 },
  7: { id: 7, name: 'Mejora Oficina Central al nivel 5', reward: 200000 },
  8: { id: 8, name: 'Construye en total 125 edifs', reward: 700000 },
  9: { id: 9, name: 'Únete a una alianza', reward: 250000 },
  10: { id: 10, name: 'Alcanza 500k de ingresos diarios', reward: 500000 },
  11: { id: 11, name: 'Consigue un total de 50 niveles en investigaciones', reward: 500000 },
  12: { id: 12, name: 'Sal de zona newbie (750k)', reward: 1000000 },
}

export async function getUserActiveTutorialTask(userID) {
  const taskData = await getTutorialTaskData(userID)
  const activeTask = tasks[taskData.task]
  if (!activeTask) return null // Finished all tasks

  const progressPercentage = await getTaskCompletionPercentage(userID, taskData)

  return {
    id: activeTask.id,
    name: activeTask.name,
    reward: activeTask.reward,
    completed: progressPercentage === 100,
    progressPercentage: progressPercentage,
  }
}

export async function completeCurrentTask(userID) {
  const task = await getUserActiveTutorialTask(userID)
  if (!task.completed) return // Not completed :(
  await mysql.query('UPDATE users SET money=money+? WHERE id=?', [task.reward, userID])
  await updateTutorialTaskData(userID, { task: task.id + 1 })
}

async function updateTutorialTaskData(userID, newTaskData) {
  await mysql.query('UPDATE users SET tutorial_task_data=? WHERE id=?', [JSON.stringify(newTaskData), userID])
}

async function getTutorialTaskData(userID) {
  const rawTaskData = await mysql.selectOne('SELECT tutorial_task_data FROM users WHERE id=?', [userID])
  if (!rawTaskData.tutorial_task_data) return { task: 1 }
  return JSON.parse(rawTaskData.tutorial_task_data)
}

export async function tutorialTaskProgressHook(userID, type, data) {
  const taskData = await getTutorialTaskData(userID)
  switch (type) {
    case 'extract_money': {
      await updateTutorialTaskData(userID, {
        task: taskData.task,
        money_extracted: (taskData.money_extracted || 0) + data,
      })
      break
    }
    default: {
      throw new Error(`Unknown tutorialTaskProgressHook type: ${type}`)
    }
  }
}

async function getTaskCompletionPercentage(userID, taskData) {
  const activeTask = tasks[taskData.task]
  if (!activeTask) return 0
  let progress = 0

  switch (activeTask.id) {
    case 1: {
      progress = await getProgressBuildingCount(userID, 1, 5)
      break
    }
    case 2: {
      progress = await getProgressBuildingCount(userID, 1, 50)
      break
    }
    case 3: {
      progress = await getProgressResearchLevel(userID, 5, 3)
      break
    }
    case 4: {
      progress = await getProgressBuildingCount(userID, 2, 20)
      break
    }
    case 5: {
      if (!taskData.money_extracted) taskData.money_extracted = 0
      const moneyExtractedObjective = 1000
      progress = (taskData.money_extracted / moneyExtractedObjective) * 100
      break
    }
    case 6: {
      progress = await getProgressResearchLevel(userID, 4, 5)
      break
    }
    case 7: {
      progress = await getProgressResearchLevel(userID, 5, 5)
      break
    }
    case 8: {
      const userBuildings = await getBuildings(userID)
      const totalBuildingCount = Object.values(userBuildings)
        .map(b => b.quantity)
        .reduce((prev, curr) => prev + curr, 0)
      const totalBuildingsNeeded = 125
      progress = (totalBuildingCount / totalBuildingsNeeded) * 100
      break
    }
    case 9: {
      const userHasAlliance = await getUserAllianceID(userID)
      if (userHasAlliance) progress = 100
      break
    }
    case 10: {
      progress = await getProgressUserDailyIncome(userID, 500000)
      break
    }
    case 11: {
      const userResearchs = await getUserResearchs(userID)
      const totalResearchLevel = Object.values(userResearchs).reduce((prev, curr) => prev + curr, 0)
      const researchLevelsNeeded = 50
      progress = (totalResearchLevel / researchLevelsNeeded) * 100
      break
    }
    case 12: {
      progress = await getProgressUserDailyIncome(userID, NEWBIE_ZONE_DAILY_INCOME)
      break
    }
  }
  return Math.min(Math.floor(progress), 100)
}

async function getProgressBuildingCount(userID, buildingID, buildingObjectiveCount) {
  const userBuildings = await getBuildings(userID)
  const buildingCount = userBuildings[buildingID].quantity
  return (buildingCount / buildingObjectiveCount) * 100
}

async function getProgressResearchLevel(userID, researchID, researchObjectiveLevel) {
  const userResearchs = await getUserResearchs(userID)
  const researchLevel = userResearchs[researchID]
  return (researchLevel / researchObjectiveLevel) * 100
}

async function getProgressUserDailyIncome(userID, neededDailyIncome) {
  const userDailyIncome = await getUserDailyIncome(userID)
  return (userDailyIncome / neededDailyIncome) * 100
}
