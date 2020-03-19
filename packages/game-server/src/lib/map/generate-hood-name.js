export default function generateHoodName(randomNumFn) {
  let newName = first[Math.floor(randomNumFn() * first.length)] + last[Math.floor(randomNumFn() * last.length)]
  // replace double spaces with single ones
  newName = newName.replace(/ +(?= )/g, '')
  // 20% of the time, add a prefix
  if (randomNumFn() < 0.2) {
    newName = prefixes[Math.floor(randomNumFn() * prefixes.length)] + newName
  }

  return newName
}

const prefixes = [
  'Little ',
  'Old ',
  'North ',
  'South ',
  'East ',
  'West ',
  'Near North ',
  'Near West ',
  'Near South ',
  'Heart of ',
  'Mount ',
]
const first = [
  'Lake',
  'River',
  'Calumet',
  'Lincoln',
  'Back of the ',
  'Garfield',
  'Douglas',
  'Prairie',
  'Ravens',
  'Greater Grand',
  'Wrigley',
  'Bronze',
  'Norwood',
  'Streeter',
  'Goose',
  'Engle',
  'Hyde',
  'Humboldt',
  'Irving',
  'Belmont',
  'Edge',
  'Rose',
  'Washington',
  'Noble',
  'Anderson',
  'Archer',
  'Gold',
  'Pulaski',
  'Rogers',
]
const last = [
  ' Park',
  'ville',
  'brook',
  'dale',
  ' Lawn',
  'wood',
  ' Town',
  'town',
  'port',
  ' View',
  ' Ridge',
  ' Manor',
  ' Triangle',
  ' Village',
  ' Glen',
  ' Coast',
  ' Square',
  ' Heights',
  ' Shore',
  'wisch',
]
