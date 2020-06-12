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
  await db.createTable('users_activity_log', {
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    date: { type: 'string', length: 21, notNull: true },
    ip: { type: 'string', length: 30, notNull: true },
    type: { type: 'string', length: 21, notNull: true },
    message: { type: 'string', length: 255, notNull: false },
    extra: { type: 'string', length: 255, notNull: false },
  })
  await db.addIndex('users_activity_log', 'idx_user_id', ['user_id'])
}

exports.down = async function(db) {
  await db.dropTable('users_activity_log')
}

exports._meta = {
  version: 1,
}
