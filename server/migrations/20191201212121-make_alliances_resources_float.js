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
  await db.changeColumn('alliances_resources', 'quantity', { type: 'decimal', length: '64, 4', notNull: true })
  await db.addIndex('alliances_resources', 'idx_alliance_id_resource', ['alliance_id', 'resource_id'], true)
  await db.removeIndex('alliances_resources', 'idx_alliance_id')
}

exports.down = async function(db) {
  await db.changeColumn('alliances_resources', 'quantity', { type: 'bigint', length: 11, notNull: true })
  await db.addIndex('alliances_resources', 'idx_alliance_id', ['alliance_id'])
  await db.removeIndex('alliances_resources', 'idx_alliance_id_resource')
}

exports._meta = {
  version: 1,
}
