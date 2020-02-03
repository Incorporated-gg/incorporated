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
  await db.createTable('alliances_research_log', {
    alliance_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    research_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    money: { type: 'bigint', length: 11, unsigned: true, notNull: true },
  })
  await db.addIndex('alliances_research_log', 'idx_alliance_id_created_at', ['alliance_id', 'created_at'])
  await db.createTable('alliances_resources_log', {
    alliance_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    resource_id: { type: 'string', length: 30, notNull: true },
    quantity: { type: 'bigint', length: 11, notNull: true },
  })
  await db.addIndex('alliances_resources_log', 'idx_alliance_id_created_at', ['alliance_id', 'created_at'])
}

exports.down = async function(db) {
  await db.removeIndex('alliances_research_log', 'idx_alliance_id_created_at')
  await db.dropTable('alliances_research_log')
  await db.removeIndex('alliances_resources_log', 'idx_alliance_id_created_at')
  await db.dropTable('alliances_resources_log')
}

exports._meta = {
  version: 1,
}
