import { calculateMissionTime, simulateAttack } from './missionsUtils'

test('Mission times', () => {
  expect(calculateMissionTime('attack')).toBe(300)
  expect(calculateMissionTime('attack')).toBe(300)
  expect(calculateMissionTime('spy')).toBe(120)
  expect(calculateMissionTime('spy')).toBe(120)
})

test('Combat normal win', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 6,
    infraResearchLvl: 20,
    attackerSabots: 3150,
    attackerThiefs: 0,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 66553250,
    destroyedBuildings: 1,
    gainedFame: 32000,
    incomeForDestroyedBuildings: 66543750,
    incomeForKilledTroops: 9500,
    realAttackerProfit: 66478250,
    result: 'win',
    robbedMoney: 0,
    survivingGuards: 0,
    survivingSabots: 3000,
    survivingThiefs: 0,
  })
})

test('Combat win, but not max buildings destroyed', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 6,
    infraResearchLvl: 20,
    attackerSabots: 950,
    attackerThiefs: 0,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 9500,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 9500,
    realAttackerProfit: -65500,
    result: 'draw',
    robbedMoney: 0,
    survivingGuards: 0,
    survivingSabots: 800,
    survivingThiefs: 0,
  })
})

test('Combat little sabots', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 1,
    infraResearchLvl: 20,
    attackerSabots: 1,
    attackerThiefs: 0,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 27,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 50,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 50,
    realAttackerProfit: -450,
    result: 'lose',
    robbedMoney: 0,
    survivingGuards: 200,
    survivingSabots: 0,
    survivingThiefs: 0,
  })
})

test('Combat no guards and little sabots', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 4,
    infraResearchLvl: 30,
    attackerSabots: 50,
    attackerThiefs: 0,
    defensorGuards: 0,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 0,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 0,
    realAttackerProfit: 0,
    result: 'draw',
    robbedMoney: 0,
    survivingGuards: 0,
    survivingSabots: 50,
    survivingThiefs: 0,
  })
})

test('Combat high infra', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 2,
    infraResearchLvl: 50,
    attackerSabots: 3000,
    attackerThiefs: 0,
    defensorGuards: 0,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 29367,
    destroyedBuildings: 1,
    gainedFame: 2000,
    incomeForDestroyedBuildings: 29367,
    incomeForKilledTroops: 0,
    realAttackerProfit: 29367,
    result: 'win',
    robbedMoney: 0,
    survivingGuards: 0,
    survivingSabots: 3000,
    survivingThiefs: 0,
  })
})

test('Combat defeat with thiefs', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 2,
    infraResearchLvl: 27,
    attackerSabots: 300,
    attackerThiefs: 1000,
    defensorGuards: 700,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 50000,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 17660,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 17660,
    realAttackerProfit: -132340,
    result: 'lose',
    robbedMoney: 0,
    survivingGuards: 34,
    survivingSabots: 0,
    survivingThiefs: 0,
  })
})

test('Combat win with thiefs', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 1,
    infraResearchLvl: 27,
    attackerSabots: 300,
    attackerThiefs: 5000,
    defensorGuards: 500,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
    unprotectedMoney: 50000,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 123792,
    destroyedBuildings: 13,
    gainedFame: 13000,
    incomeForDestroyedBuildings: 57792,
    incomeForKilledTroops: 16000,
    realAttackerProfit: -26208,
    result: 'win',
    robbedMoney: 50000,
    survivingGuards: 0,
    survivingSabots: 0,
    survivingThiefs: 4625,
  })
})

test('Robbed less money than max', () => {
  const attackResult = simulateAttack({
    buildingAmount: 0,
    buildingID: 1,
    infraResearchLvl: 1,
    attackerSabots: 7,
    attackerThiefs: 13,
    defensorGuards: 0,
    defensorSecurityLvl: 1,
    attackerSabotageLvl: 1,
    unprotectedMoney: 100000,
  })
  expect(attackResult.realAttackerProfit).toBe(685)
})

test('Robbed max money with only thieves', () => {
  const attackResult = simulateAttack({
    buildingAmount: 0,
    buildingID: 1,
    infraResearchLvl: 1,
    attackerSabots: 0,
    attackerThiefs: 2000,
    defensorGuards: 0,
    defensorSecurityLvl: 1,
    attackerSabotageLvl: 1,
    unprotectedMoney: 100000,
  })
  expect(attackResult.realAttackerProfit).toBe(100000)
})
