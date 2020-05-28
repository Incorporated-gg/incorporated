import mysql from '../../mysql'
import { getUserActiveTasks, getUserTaskData } from '.'
import { calcBuildingDailyIncome } from 'shared-lib/buildingsUtils'
import { getUserBuildings, getUserResearchs } from '../users'

const CENTRAL_OFFICE_RESEARCH_ID = 5

export default async function tasksProgressHook(userID, hookType, hookData) {
  const [userActiveTasks, userTaskData] = await Promise.all([getUserActiveTasks(userID), getUserTaskData(userID)])

  let newUserTaskData = {}
  switch (hookType) {
    case 'build_building': {
      if (hookData.buildingID === undefined) throw new Error('Invalid hookData')

      const buildTasks = userActiveTasks
        .filter(task => task.type === 'cyclic_build')
        .filter(task => task.requirements.buildingID === hookData.buildingID)
      buildTasks.forEach(activeTask => {
        const taskData = userTaskData[`task${activeTask.id}`] || {}
        taskData.count = (taskData.count || 0) + 1
        newUserTaskData[`task${activeTask.id}`] = taskData
      })

      const incomeTasks = userActiveTasks.filter(task => task.type === 'cyclic_income')
      if (incomeTasks.length) {
        const [userBuildings, userResearchs] = await Promise.all([getUserBuildings(userID), getUserResearchs(userID)])

        const newIncome = calculateIncome(userBuildings, userResearchs[CENTRAL_OFFICE_RESEARCH_ID])
        userBuildings[hookData.buildingID].quantity--
        const oldIncome = calculateIncome(userBuildings, userResearchs[CENTRAL_OFFICE_RESEARCH_ID])
        const incomeDiff = newIncome - oldIncome

        incomeTasks.forEach(activeTask => {
          const taskData = userTaskData[`task${activeTask.id}`] || {}
          taskData.count = (taskData.count || 0) + incomeDiff
          newUserTaskData[`task${activeTask.id}`] = taskData
        })
      }
      break
    }
    case 'attack_finished': {
      if (hookData.result === undefined || hookData.robbedMoney === undefined) throw new Error('Invalid hookData')

      if (hookData.result === 'win') {
        const attackTasks = userActiveTasks.filter(task => task.type === 'cyclic_attack')
        attackTasks.forEach(activeTask => {
          const taskData = userTaskData[`task${activeTask.id}`] || {}
          taskData.count = (taskData.count || 0) + 1
          newUserTaskData[`task${activeTask.id}`] = taskData
        })
      }

      if (hookData.robbedMoney > 0) {
        const robTasks = userActiveTasks.filter(task => task.type === 'cyclic_rob')
        robTasks.forEach(activeTask => {
          const taskData = userTaskData[`task${activeTask.id}`] || {}
          taskData.count = (taskData.count || 0) + hookData.robbedMoney
          newUserTaskData[`task${activeTask.id}`] = taskData
        })
      }
      break
    }
    case 'research_finished': {
      if (hookData.researchID === undefined) throw new Error('Invalid hookData')

      if (hookData.researchID === CENTRAL_OFFICE_RESEARCH_ID) {
        // Central Office: affects cyclic_income tasks, but doesn't count for cyclic_research
        const incomeTasks = userActiveTasks.filter(task => task.type === 'cyclic_income')
        if (incomeTasks.length) {
          const userBuildings = await getUserBuildings(userID)
          const userResearchs = await getUserResearchs(userID)

          const oldIncome = calculateIncome(userBuildings, userResearchs[CENTRAL_OFFICE_RESEARCH_ID] - 1)
          const newIncome = calculateIncome(userBuildings, userResearchs[CENTRAL_OFFICE_RESEARCH_ID])
          const incomeDiff = newIncome - oldIncome

          incomeTasks.forEach(activeTask => {
            const taskData = userTaskData[`task${activeTask.id}`] || {}
            taskData.count = (taskData.count || 0) + incomeDiff
            newUserTaskData[`task${activeTask.id}`] = taskData
          })
        }
        break
      }

      const researchTasks = userActiveTasks.filter(task => task.type === 'cyclic_research')
      researchTasks.forEach(activeTask => {
        const taskData = userTaskData[`task${activeTask.id}`] || {}
        taskData.count = (taskData.count || 0) + 1
        newUserTaskData[`task${activeTask.id}`] = taskData
      })
      break
    }
    case 'extracted_money': {
      if (hookData.extractedMoney === undefined) throw new Error('Invalid hookData')

      const extractMoneyTasks = userActiveTasks.filter(task => task.type === 'cyclic_extract_money')
      extractMoneyTasks.forEach(activeTask => {
        const taskData = userTaskData[`task${activeTask.id}`] || {}
        taskData.count = (taskData.count || 0) + hookData.extractedMoney
        newUserTaskData[`task${activeTask.id}`] = taskData
      })

      break
    }
    default: {
      throw new Error(`Unknown tasksProgressHook type: ${hookType}`)
    }
  }

  if (!Object.keys(newUserTaskData).length) return // No changes to user task data

  await mysql.query('UPDATE users SET task_data=? WHERE id=?', [
    JSON.stringify({ ...userTaskData, ...newUserTaskData }),
    userID,
  ])
}

function calculateIncome(buildings, optimizeLvl) {
  return Object.entries(buildings).reduce(
    (prev, [buildingID, { quantity }]) => prev + calcBuildingDailyIncome(parseInt(buildingID), quantity, optimizeLvl),
    0
  )
}
