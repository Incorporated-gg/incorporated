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
  await db.addColumn('missions', 'gained_fame', { type: 'int', length: 11, unsigned: true, notNull: false })
  await db.addColumn('missions', 'won', { type: 'boolean', notNull: false })
  await db.addColumn('missions', 'profit', { type: 'bigint', length: 11, notNull: false })
  await db.createTable('contests', {
    id: { type: 'int', length: 11, autoIncrement: true, primaryKey: true, notNull: true },
    name: { type: 'text', length: 12, notNull: true },
    started_at: { type: 'int', length: 11, notNull: true },
    ended_at: { type: 'int', length: 11, notNull: false },
  })
  await db.createTable('contests_scoreboards', {
    contest_id: { type: 'int', length: 11, notNull: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    score: { type: 'bigint', length: 18, unsigned: true, notNull: true },
    rank: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
  await db.addIndex('contests_scoreboards', 'idx_rank', ['rank'])
}

exports.down = async function(db) {
  await db.removeColumn('missions', 'gained_fame')
  await db.removeColumn('missions', 'won')
  await db.removeColumn('missions', 'profit')
  await db.dropTable('contests')
  await db.removeIndex('contests_scoreboards', 'idx_rank')
  await db.dropTable('contests_scoreboards')
}

exports._meta = {
  version: 1,
}
