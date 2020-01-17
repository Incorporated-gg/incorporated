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
  await db.createTable('alliances_wars', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, unique: true, autoIncrement: true },
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    completed: { type: 'boolean', notNull: true, defaultValue: false },
    alliance1_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    alliance2_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    data: { type: 'string', length: 3000 },
  })
}

exports.down = async function(db) {
  await db.dropTable('alliances_wars')
}

exports._meta = {
  version: 1,
}
