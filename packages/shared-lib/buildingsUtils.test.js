const { calcBuildingResistance } = require('./buildingsUtils')

test('Infra', () => {
  expect(calcBuildingResistance(1, 1)).toBe(25)
  expect(calcBuildingResistance(6, 1)).toBe(812)
  expect(calcBuildingResistance(1, 24)).toBe(3837)
  expect(calcBuildingResistance(4, 30)).toBe(62005)
  expect(calcBuildingResistance(5, 40)).toBe(367988)
})
