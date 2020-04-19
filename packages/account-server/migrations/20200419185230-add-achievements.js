'use strict'
/* eslint-disable no-unused-vars */

let dbm
let type
let seed

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
  await db.createTable('users_stats', {
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    stat_id: { type: 'string', length: 30, notNull: true },
    value: { type: 'bigint', length: 11, unsigned: true },
  })
  await db.addIndex('users_stats', 'idx_user_id', ['user_id'])
  await db.createTable('users_achievements', {
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    achievement_id: { type: 'string', length: 30, notNull: true },
  })
  await db.addIndex('users_achievements', 'idx_user_id', ['user_id'])
}

exports.down = async function(db) {
  await db.dropTable('users_stats')
  await db.dropTable('users_achievements')
}

exports._meta = {
  version: 1,
}
