import { calculateMissionTime } from '../build/missionsUtils'
import { simulateAttack } from '../build/simulateAttack'

test('Mission times', () => {
  expect(calculateMissionTime('attack')).toBe(300)
  expect(calculateMissionTime('spy')).toBe(60)
})

test('Combat normal win', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 6,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 20,
    attackerSabots: 3150,
    attackerThieves: 0,
    defensorGuards: 200,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 66545750,
    destroyedBuildings: 1,
    gainedFame: 32000,
    incomeForDestroyedBuildings: 66543750,
    incomeForKilledTroops: 2000,
    realAttackerProfit: 66470750,
    result: 'win',
    robbedMoney: 0,
    killedGuards: 200,
    killedSabots: 150,
    killedThieves: 0,
  })
})

test('Combat draw: kill all guards, but no buildings destroyed', () => {
  const attackResult = simulateAttack({
    buildingAmount: 40,
    buildingID: 6,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 20,
    defensorSecurityLvl: 30,
    attackerSabots: 950,
    attackerThieves: 0,
    defensorGuards: 200,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 2000,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 2000,
    realAttackerProfit: -48000,
    result: 'draw',
    robbedMoney: 0,
    killedGuards: 200,
    killedSabots: 100,
    killedThieves: 0,
  })
})

test('Combat little sabots', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 1,
    attackerSabotageLvl: 29,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 10,
    attackerSabots: 2,
    attackerThieves: 0,
    defensorGuards: 200,
    unprotectedMoney: 0,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 10,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 10,
    realAttackerProfit: -990,
    result: 'lose',
    robbedMoney: 0,
    killedGuards: 1,
    killedSabots: 2,
    killedThieves: 0,
  })
})

test('Combat no guards and little sabots', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 4,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 30,
    attackerSabots: 50,
    attackerThieves: 0,
    defensorGuards: 0,
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
    killedGuards: 0,
    killedSabots: 0,
    killedThieves: 0,
  })
})

test('Combat high security', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 2,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 50,
    attackerSabots: 3000,
    attackerThieves: 0,
    defensorGuards: 0,
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
    killedGuards: 0,
    killedSabots: 0,
    killedThieves: 0,
  })
})

test('Combat defeat with thieves', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 2,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 27,
    attackerSabots: 300,
    attackerThieves: 1000,
    defensorGuards: 700,
    unprotectedMoney: 50000,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 6660,
    destroyedBuildings: 0,
    gainedFame: 0,
    incomeForDestroyedBuildings: 0,
    incomeForKilledTroops: 6660,
    realAttackerProfit: -343340,
    result: 'lose',
    robbedMoney: 0,
    killedGuards: 666,
    killedSabots: 300,
    killedThieves: 1000,
  })
})

test('Combat win with thieves', () => {
  const attackResult = simulateAttack({
    buildingAmount: 100,
    buildingID: 1,
    attackerSabotageLvl: 40,
    defensorDefenseLvl: 30,
    defensorSecurityLvl: 27,
    attackerSabots: 300,
    attackerThieves: 5000,
    defensorGuards: 500,
    unprotectedMoney: 50000,
  })
  expect(attackResult).toEqual({
    attackerTotalIncome: 112792,
    destroyedBuildings: 13,
    gainedFame: 13000,
    incomeForDestroyedBuildings: 57792,
    incomeForKilledTroops: 5000,
    realAttackerProfit: -112208,
    result: 'win',
    robbedMoney: 50000,
    killedGuards: 500,
    killedSabots: 300,
    killedThieves: 375,
  })
})

test('Robbed less money than max, with little thieves', () => {
  const attackResult = simulateAttack({
    buildingAmount: 0,
    buildingID: 1,
    attackerSabotageLvl: 1,
    defensorDefenseLvl: 1,
    defensorSecurityLvl: 1,
    attackerSabots: 7,
    attackerThieves: 13,
    defensorGuards: 0,
    unprotectedMoney: 100000,
  })
  expect(attackResult.realAttackerProfit).toBe(650)
})

test('Robbed max money with only thieves', () => {
  const attackResult = simulateAttack({
    buildingAmount: 0,
    buildingID: 1,
    attackerSabotageLvl: 1,
    defensorDefenseLvl: 1,
    defensorSecurityLvl: 1,
    attackerSabots: 0,
    attackerThieves: 2000,
    defensorGuards: 0,
    unprotectedMoney: 100000,
  })
  expect(attackResult.realAttackerProfit).toBe(100000)
})
