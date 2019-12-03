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
  await db.createTable('missions', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
    user_id: { type: 'int', length: 11, notNull: true },
    mission_type: { type: 'string', length: 13, notNull: true },
    target_building: { type: 'string', length: 13, notNull: false },
    target_user: { type: 'int', length: 11, notNull: true },
    personnel_sent: { type: 'bigint', length: 11, notNull: true },
    started_at: { type: 'int', length: 11, notNull: true },
    will_finish_at: { type: 'int', length: 11, notNull: true },
    completed: { type: 'boolean', notNull: true, defaultValue: false },
  })
}

exports.down = async function(db) {
  await db.dropTable('missions')
}

exports._meta = {
  version: 1,
}
