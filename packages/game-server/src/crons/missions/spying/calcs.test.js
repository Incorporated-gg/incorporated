const { _calcFailProbability, _calcInformationObtainedProbabilities } = require('./calcs')

test('Spy 1', () => {
  expect(
    _calcFailProbability({
      resLvLDefender: 32,
      resLvlAttacker: 10,
      spiesSent: 10,
    })
  ).toBe(3.30311084960767)

  expect(
    _calcInformationObtainedProbabilities({
      resLvLDefender: 32,
      spiesRemaining: 10,
    })
  ).toEqual({
    minInfo: 'nothing',
    maxInfo: 'buildings',
    maxInfoProb: 0.29708853238265004,
  })
})

test('Spy 2', () => {
  expect(
    _calcFailProbability({
      resLvLDefender: 32,
      resLvlAttacker: 10,
      spiesSent: 100,
    })
  ).toBe(112.16033757648157)

  expect(
    _calcInformationObtainedProbabilities({
      resLvLDefender: 32,
      spiesRemaining: 100,
    })
  ).toEqual({
    minInfo: 'personnel',
    maxInfo: 'research',
    maxInfoProb: 0.9708853238265001,
  })
})

test('Spy 3', () => {
  expect(
    _calcFailProbability({
      resLvLDefender: 10,
      resLvlAttacker: 40,
      spiesSent: 10,
    })
  ).toBe(0.004297911912563827)

  expect(
    _calcInformationObtainedProbabilities({
      resLvLDefender: 10,
      spiesRemaining: 10,
    })
  ).toEqual({
    minInfo: 'personnel',
    maxInfo: 'research',
    maxInfoProb: 1,
  })
})

test('Spy 4', () => {
  expect(
    _calcFailProbability({
      resLvLDefender: 10,
      resLvlAttacker: 40,
      spiesSent: 100,
    })
  ).toBe(0.04103260579011485)

  expect(
    _calcInformationObtainedProbabilities({
      resLvLDefender: 10,
      spiesRemaining: 100,
    })
  ).toEqual({
    minInfo: 'personnel',
    maxInfo: 'research',
    maxInfoProb: 1,
  })
})
