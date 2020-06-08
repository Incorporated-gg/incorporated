import mysql from '../../mysql'
import { getAllianceBasicData } from '.'

export async function getActiveWarIDBetweenAlliances(allianceID1, allianceID2) {
  const war = await mysql.selectOne(
    'SELECT id FROM alliances_wars WHERE completed=0 AND ((alliance1_id=? AND alliance2_id=?) OR (alliance2_id=? AND alliance1_id=?))',
    [allianceID1, allianceID2, allianceID1, allianceID2]
  )
  if (!war) return null

  return war.id
}

export async function getAllianceActiveWars(allianceID) {
  let activeWars = await mysql.query(
    'SELECT id FROM alliances_wars WHERE completed=0 AND (alliance1_id=? OR alliance2_id=?) ORDER BY created_at DESC',
    [allianceID, allianceID]
  )
  activeWars = await Promise.all(activeWars.map(war => getWarData(war.id)))

  return activeWars
}

export async function getAlliancePastWars(allianceID) {
  let pastWars = await mysql.query(
    'SELECT id FROM alliances_wars WHERE completed=1 AND (alliance1_id=? OR alliance2_id=?) ORDER BY created_at DESC LIMIT 10',
    [allianceID, allianceID]
  )
  pastWars = await Promise.all(pastWars.map(war => getWarData(war.id)))

  return pastWars
}

export async function getWarData(warID, { includeRawData = false } = {}) {
  const war = await mysql.selectOne(
    'SELECT id, created_at, alliance1_id, alliance2_id, data FROM alliances_wars WHERE id=?',
    [warID]
  )

  const alliance1 = await getAllianceBasicData(war.alliance1_id)
  const alliance2 = await getAllianceBasicData(war.alliance2_id)

  const data = JSON.parse(war.data)
  const days = data.days
  const winner = data.winner

  const alliance1Aids = []
  const alliance2Aids = []
  const warAids = await mysql.query(
    'SELECT aided_alliance_id, aiding_alliance_id, accepted_at FROM alliances_wars_aid WHERE war_id=? AND accepted=1',
    [warID]
  )
  await Promise.all(
    warAids.map(async aid => {
      const aidingAlliance = await getAllianceBasicData(aid.aiding_alliance_id)
      const arrayToAppend = aid.aided_alliance_id === alliance1.id ? alliance1Aids : alliance2Aids
      arrayToAppend.push({
        alliance: aidingAlliance,
        accepted_at: aid.accepted_at,
      })
    })
  )

  const result = {
    id: war.id,
    created_at: war.created_at,
    days,
    winner,
    alliance1_aids: alliance1Aids,
    alliance2_aids: alliance2Aids,
    alliance1: alliance1,
    alliance2: alliance2,
    _data: data,
  }
  if (!includeRawData) delete result._data
  return result
}
