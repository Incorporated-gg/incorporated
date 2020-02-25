export default function generateTasksList() {
  const totalTasks = 500
  const cyclicTypes = ['cyclic_build', 'cyclic_attack', 'cyclic_research', 'cyclic_rob', 'cyclic_income']
  const barrierTypes = ['barrier_income', 'barrier_research', 'barrier_centraloffice']

  const generatedTasks = []
  let cyclicCounter = 0
  let barrierCounter = 0
  let taskTypeCounter = {}
  for (let taskID = 1; taskID <= totalTasks; taskID++) {
    // Find task type
    let type
    if (taskID % 6) {
      type = cyclicTypes[cyclicCounter]
      cyclicCounter = (cyclicCounter + 1) % cyclicTypes.length
    } else {
      type = barrierTypes[barrierCounter]
      barrierCounter = (barrierCounter + 1) % barrierTypes.length
    }

    // Get task requirements based on type and taskID
    if (!taskTypeCounter[type]) taskTypeCounter[type] = 0
    const typeCounter = taskTypeCounter[type]++
    let requirements = {}
    switch (type) {
      case 'cyclic_build': {
        const initialBuildingID = 2
        const buildingID = ((typeCounter + initialBuildingID - 1) % 6) + 1 // Start on building 2, and loop
        const amount = Math.pow(2, 6 - buildingID) * (typeCounter + 1) // Equivalent to +1 hotel every loop

        requirements.buildingID = buildingID
        requirements.amount = amount
        break
      }
      case 'cyclic_attack': {
        const amount = typeCounter + 1
        requirements.amount = amount
        break
      }
      case 'cyclic_research': {
        const amount = typeCounter + 5
        requirements.amount = amount
        break
      }
      case 'cyclic_rob': {
        const amount = 300000 * (typeCounter + 1)
        requirements.amount = amount
        break
      }
      case 'cyclic_income': {
        const amount =
          typeCounter === 0
            ? 300000
            : typeCounter === 1
            ? 600000
            : typeCounter === 2
            ? 1000000
            : 1000000 + (typeCounter - 2) * 200000
        requirements.amount = amount
        break
      }
      case 'barrier_income': {
        const amount =
          typeCounter === 0
            ? 2000000
            : typeCounter === 1
            ? 7000000
            : typeCounter === 2
            ? 20000000
            : 20000000 + (typeCounter - 2) * 15000000
        requirements.amount = amount
        break
      }
      case 'barrier_research': {
        const amount = 100 + typeCounter * 50
        requirements.amount = amount
        break
      }
      case 'barrier_centraloffice': {
        const amount = 14 + typeCounter * 2
        requirements.amount = amount
        break
      }
    }

    const task = {
      id: taskID,
      reward: taskID * 50000,
      type,
      requirements,
    }
    generatedTasks.push(task)
  }
  return generatedTasks
}
