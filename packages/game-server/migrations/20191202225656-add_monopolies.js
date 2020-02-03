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
  await db.addIndex('buildings', 'idx_id', ['id'])
  await db.createTable('monopolies', {
    building_id: { type: 'int', length: 11, unsigned: true, notNull: true, primaryKey: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    building_quantity: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
}

exports.down = async function(db) {
  await db.removeIndex('buildings', 'idx_id')
  await db.dropTable('monopolies')
}

exports._meta = {
  version: 1,
}
