export default function generateTasksList() {
  const totalTasks = 500
  const cyclicTypes = [
    'cyclic_build',
    'cyclic_extract_money',
    'cyclic_attack',
    'cyclic_research',
    'cyclic_rob',
    'cyclic_income',
  ]
  const barrierTypes = ['barrier_income', 'barrier_research', 'barrier_centraloffice']

  const generatedTasks = [...initialTasks]
  let cyclicCounter = 0
  let barrierCounter = 0
  let taskTypeCounter = {}
  for (let taskID = 1; taskID <= totalTasks; taskID++) {
    // Find task type
    let type
    const shouldBeBarrier = taskID % (cyclicTypes.length + 1) === 0
    if (shouldBeBarrier) {
      type = barrierTypes[barrierCounter]
      barrierCounter = (barrierCounter + 1) % barrierTypes.length
    } else {
      type = cyclicTypes[cyclicCounter]
      cyclicCounter = (cyclicCounter + 1) % cyclicTypes.length
    }

    // Get task requirements based on type and taskID
    if (!taskTypeCounter[type]) taskTypeCounter[type] = 0
    const typeCounter = taskTypeCounter[type]++
    let requirements = {}
    switch (type) {
      case 'cyclic_build': {
        const initialBuildingID = 5 // Cinemas
        const buildingID = ((typeCounter + initialBuildingID - 1) % 6) + 1 // Start on building 2, and loop
        const amount = Math.floor(Math.pow(2, 6 - buildingID) * (typeCounter + 0.5)) // Equivalent to +1 hotel every loop, starting with 0.5 hotels (1 cinema)

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
        const amount = 100000 + 300000 * typeCounter
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
      case 'cyclic_extract_money': {
        let amount = 400000
        for (let i = 1; i <= typeCounter; i++) {
          amount += 400000 + 100000 * (i + 1)
        }
        requirements.amount = amount
        break
      }
      case 'barrier_income': {
        const amount =
          typeCounter === 0
            ? 2000000
            : typeCounter === 1
            ? 8000000
            : typeCounter === 2
            ? 16000000
            : 16000000 + (typeCounter - 2) * 10000000
        requirements.amount = amount
        break
      }
      case 'barrier_research': {
        const amount = 100 + typeCounter * 50
        requirements.amount = amount
        break
      }
      case 'barrier_centraloffice': {
        const amount = 12 + typeCounter * 2
        requirements.amount = amount
        break
      }
    }

    const task = {
      id: taskID + initialTasks.length,
      reward: taskID * 50000,
      type,
      requirements,
    }
    generatedTasks.push(task)
  }
  return generatedTasks
}

const initialTasks = [
  {
    id: 1,
    reward: 50000,
    type: 'cyclic_build',
    requirements: {
      buildingID: 1,
      amount: 5,
    },
  },
  {
    id: 2,
    reward: 250000,
    type: 'cyclic_build',
    requirements: {
      buildingID: 1,
      amount: 50,
    },
  },
  {
    id: 3,
    reward: 150000,
    type: 'barrier_centraloffice',
    requirements: {
      amount: 3,
    },
  },
  {
    id: 4,
    reward: 150000,
    type: 'cyclic_build',
    requirements: {
      buildingID: 2,
      amount: 20,
    },
  },
  {
    id: 5,
    reward: 50000,
    type: 'cyclic_extract_money',
    requirements: {
      amount: 1000,
    },
  },
  {
    id: 6,
    reward: 50000,
    type: 'custom_bank',
    requirements: {
      amount: 5,
    },
  },
  {
    id: 7,
    reward: 200000,
    type: 'barrier_centraloffice',
    requirements: {
      amount: 5,
    },
  },
  {
    id: 8,
    reward: 700000,
    type: 'cyclic_income',
    requirements: {
      amount: 100000,
    },
  },
  {
    id: 9,
    reward: 250000,
    type: 'custom_join_alliance',
    requirements: { amount: 1 },
  },
  {
    id: 10,
    reward: 500000,
    type: 'barrier_income',
    requirements: {
      amount: 500000,
    },
  },
  {
    id: 11,
    reward: 500000,
    type: 'barrier_research',
    requirements: {
      amount: 50,
    },
  },
  {
    id: 12,
    reward: 1000000,
    type: 'barrier_income',
    requirements: {
      amount: 750000,
    },
  },
]
