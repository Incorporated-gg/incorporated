const { calcBuildingResistance } = require('./buildingsUtils')

test('Infra', () => {
  expect(calcBuildingResistance(1, 1)).toBe(81)
  expect(calcBuildingResistance(10, 1)).toBe(812)
  expect(calcBuildingResistance(1, 24)).toBe(12278)
  expect(calcBuildingResistance(4, 30)).toBe(35432)
  expect(calcBuildingResistance(9, 40)).toBe(367988)
})
