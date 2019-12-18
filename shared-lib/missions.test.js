import { calculateMissionTime, simulateAttack } from './missionsUtils'

test('Mission times', () => {
  expect(calculateMissionTime('attack', 100)).toBe(300)
  expect(calculateMissionTime('attack', 1)).toBe(300)
  expect(calculateMissionTime('spy', 100)).toBe(120)
  expect(calculateMissionTime('spy', 1)).toBe(120)
})

test('Combat normal win', () => {
  const attackResult = simulateAttack({
    defensorNumEdificios: 100,
    buildingID: 9,
    defensorInfraLvl: 20,
    attackerSabots: 3150,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
  })
  expect(attackResult.result).toBe('win')
  expect(attackResult.destroyedBuildings).toBe(2)
  expect(attackResult.realAttackerProfit).toBe(9950500)
  expect(attackResult.survivingSabots).toBe(3000)
  expect(attackResult.survivingGuards).toBe(0)
})

test('Combat win, but not max buildings destroyed', () => {
  const attackResult = simulateAttack({
    defensorNumEdificios: 100,
    buildingID: 9,
    defensorInfraLvl: 20,
    attackerSabots: 950,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
  })
  expect(attackResult.result).toBe('win')
  expect(attackResult.destroyedBuildings).toBe(1)
  expect(attackResult.realAttackerProfit).toBe(4942500)
  expect(attackResult.survivingSabots).toBe(800)
  expect(attackResult.survivingGuards).toBe(0)
})

test('Combat little sabots', () => {
  const attackResult = simulateAttack({
    defensorNumEdificios: 100,
    buildingID: 1,
    defensorInfraLvl: 20,
    attackerSabots: 1,
    defensorGuards: 200,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 27,
  })
  expect(attackResult.result).toBe('lose')
  expect(attackResult.destroyedBuildings).toBe(0)
  expect(attackResult.realAttackerProfit).toBe(-450)
  expect(attackResult.survivingSabots).toBe(0)
  expect(attackResult.survivingGuards).toBe(200)
})

test('Combat no guards and little sabots', () => {
  const attackResult = simulateAttack({
    defensorNumEdificios: 100,
    buildingID: 7,
    defensorInfraLvl: 30,
    attackerSabots: 50,
    defensorGuards: 0,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
  })
  expect(attackResult.result).toBe('draw')
  expect(attackResult.destroyedBuildings).toBe(0)
  expect(attackResult.realAttackerProfit).toBe(0)
  expect(attackResult.survivingSabots).toBe(50)
  expect(attackResult.survivingGuards).toBe(0)
})

test('Combat high infra', () => {
  const attackResult = simulateAttack({
    defensorNumEdificios: 100,
    buildingID: 2,
    defensorInfraLvl: 50,
    attackerSabots: 3000,
    defensorGuards: 0,
    defensorSecurityLvl: 30,
    attackerSabotageLvl: 40,
  })
  expect(attackResult.result).toBe('win')
  expect(attackResult.destroyedBuildings).toBe(1)
  expect(attackResult.realAttackerProfit).toBe(9380)
  expect(attackResult.survivingSabots).toBe(3000)
  expect(attackResult.survivingGuards).toBe(0)
})
