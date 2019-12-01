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
  await db.removeColumn('ranking', 'id')
  await db.addColumn('ranking', 'rank', { type: 'int', length: 11, unsigned: true, notNull: true })
  await db.addIndex('ranking', 'idx_rank', ['rank'])

  await db.createTable('alliances', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
    created_at: { type: 'int', length: 11, notNull: true },
    picture_url: { type: 'string', length: 50 },
    long_name: { type: 'string', length: 30, notNull: true, unique: true },
    short_name: { type: 'string', length: 5, notNull: true, unique: true },
    description: { type: 'string', length: 1000 },
  })
  await db.createTable('alliances_members', {
    created_at: { type: 'int', length: 11, notNull: true },
    alliance_id: { type: 'int', length: 11, notNull: true },
    user_id: { type: 'int', length: 11, notNull: true, unique: true },
    rank_name: { type: 'string', length: 50, notNull: true },
    is_admin: { type: 'boolean', notNull: true },
  })
  await db.addIndex('alliances_members', 'idx_alliance_id', ['alliance_id'])
  await db.createTable('alliances_research', {
    id: { type: 'int', length: 11, notNull: true },
    alliance_id: { type: 'int', length: 11, notNull: true },
    level: { type: 'int', length: 11, notNull: true },
    progress_money: { type: 'bigint', length: 11, notNull: true },
  })
  await db.addIndex('alliances_research', 'idx_alliance_id', ['alliance_id'])
  await db.createTable('alliances_member_requests', {
    created_at: { type: 'int', length: 11, notNull: true },
    alliance_id: { type: 'int', length: 11, notNull: true },
    user_id: { type: 'int', length: 11, notNull: true },
  })
  await db.createTable('alliances_resources', {
    alliance_id: { type: 'int', length: 11, notNull: true },
    resource_id: { type: 'string', length: 11, notNull: true },
    quantity: { type: 'bigint', length: 11, notNull: true },
  })
  await db.addIndex('alliances_resources', 'idx_alliance_id', ['alliance_id'])
}

exports.down = async function(db) {
  await db.removeIndex('ranking', 'idx_rank')
  await db.removeColumn('ranking', 'rank')
  await db.addColumn('ranking', 'id', { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true })

  await db.dropTable('alliances')
  await db.removeIndex('alliances_members', 'idx_alliance_id')
  await db.dropTable('alliances_members')
  await db.removeIndex('alliances_research', 'idx_alliance_id')
  await db.dropTable('alliances_research')
  await db.dropTable('alliances_member_requests')
  await db.removeIndex('alliances_resources', 'idx_alliance_id')
  await db.dropTable('alliances_resources')
}

exports._meta = {
  version: 1,
}
