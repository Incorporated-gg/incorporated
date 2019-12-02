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
  await db.createTable('users_resources', {
    user_id: { type: 'int', length: 11, notNull: true },
    resource_id: { type: 'string', length: 13, notNull: true },
    quantity: { type: 'bigint', length: 11, notNull: true },
  })
}

exports.down = async function(db) {
  await db.dropTable('users_resources')
}

exports._meta = {
  version: 1,
}
