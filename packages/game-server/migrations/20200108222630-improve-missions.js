'use strict'
/* eslint-disable no-unused-vars */

var dbm
var type
var seed

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate
  type = dbm.dataType
  seed = seedLink
}

exports.up = async function(db) {
  await db.addColumn('missions', 'data', { type: 'string', length: '3000', notNull: true })
  const missions = await db.runSql('SELECT id, mission_type, target_building, personnel_sent FROM missions')
  await Promise.all(
    missions.map(async mission => {
      const data = JSON.stringify({
        building: mission.target_building,
        spies: mission.mission_type === 'spy' ? mission.personnel_sent : undefined,
        sabots: mission.mission_type === 'attack' ? mission.personnel_sent : undefined,
      })
      await db.runSql('UPDATE missions SET data=? WHERE id=?', [data, mission.id], null)
    })
  )
  await db.removeColumn('missions', 'target_building')
  await db.removeColumn('missions', 'personnel_sent')
}

exports.down = async function(db) {
  await db.addColumn('missions', 'target_building', { type: 'string', length: 13, notNull: false })
  await db.addColumn('missions', 'personnel_sent', { type: 'bigint', length: 11, notNull: true })
  const missions = await db.runSql('SELECT id, data FROM missions')
  await Promise.all(
    missions.map(async mission => {
      try {
        const data = JSON.parse(mission.data)
        const personnelSent = data.spies || data.sabots || null
        await db.runSql(
          "UPDATE missions SET target_building='?', personnel_sent='?' WHERE id='?'",
          [data.building, personnelSent, mission.id],
          null
        )
      } catch (e) {}
    })
  )
  await db.removeColumn('missions', 'data')
}

exports._meta = {
  version: 1,
}
