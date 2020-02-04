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
  await db.createTable('research_active', {
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    research_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    finishes_at: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
  await db.addIndex('research_active', 'idx_user_id', ['user_id'])
}

exports.down = async function(db) {
  await db.dropTable('research_active')
}

exports._meta = {
  version: 1,
}
