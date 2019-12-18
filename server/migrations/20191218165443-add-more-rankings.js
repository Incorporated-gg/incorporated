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
  await db.renameTable('ranking', 'ranking_income')
  await db.renameColumn('ranking_income', 'income', 'points')
  await db.changeColumn('ranking_income', 'user_id', {
    type: 'int',
    length: 11,
    unsigned: true,
    notNull: true,
    unique: true,
  })
  await db.createTable('ranking_alliances', {
    rank: { type: 'int', length: 11, unsigned: true, notNull: true },
    alliance_id: { type: 'int', length: 11, unsigned: true, notNull: true, unique: true },
    points: { type: 'int', length: 11, unsigned: true, notNull: true, defaultValue: 0 },
  })
  await db.addIndex('ranking_alliances', 'idx_rank', ['rank'])
  await db.createTable('ranking_research', {
    rank: { type: 'int', length: 11, unsigned: true, notNull: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true, unique: true },
    points: { type: 'int', length: 11, unsigned: true, notNull: true, defaultValue: 0 },
  })
  await db.addIndex('ranking_research', 'idx_rank', ['rank'])
}

exports.down = async function(db) {
  await db.changeColumn('ranking_income', 'user_id', { type: 'int', length: 11, unsigned: true, notNull: true })
  await db.renameColumn('ranking_income', 'points', 'income')
  await db.renameTable('ranking_income', 'ranking')
  await db.dropTable('ranking_alliances')
  await db.dropTable('ranking_research')
}

exports._meta = {
  version: 1,
}
