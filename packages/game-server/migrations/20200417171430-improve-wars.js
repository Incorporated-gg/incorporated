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
  await db.runSql('DELETE FROM alliances_wars')
  await db.runSql('DELETE FROM hoods')
  await db.addIndex('hoods', 'idx_hood_id', ['id'])

  await db.addColumn('alliances_wars', 'alliance1_hoods', { type: 'string', length: 200 })
  await db.addColumn('alliances_wars', 'alliance2_hoods', { type: 'string', length: 200 })

  await db.createTable('alliances_wars_aid', {
    war_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    aided_alliance_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    aiding_alliance_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    accepted: { type: 'boolean', defaultValue: false, notNull: true },
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    accepted_at: { type: 'int', length: 11, unsigned: true },
  })
  await db.addIndex('alliances_wars_aid', 'idx_war_id', ['war_id'])
}

exports.down = async function(db) {
  await db.removeIndex('hoods', 'idx_hood_id')
  await db.dropTable('alliances_wars_aid')
  await db.removeColumn('alliances_wars', 'alliance1_hoods')
  await db.removeColumn('alliances_wars', 'alliance2_hoods')
}

exports._meta = {
  version: 1,
}
