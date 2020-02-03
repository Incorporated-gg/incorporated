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
  await db.createTable('users', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
    username: { type: 'string', length: 20, notNull: true, unique: true },
    email: { type: 'string', length: 100, notNull: true, unique: true },
    password: { type: 'string', length: 200, notNull: true },
  })
  await db.createTable('sessions', {
    id: { type: 'string', length: 100, notNull: true, primaryKey: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    last_used_at: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
}

exports.down = async function(db) {
  await db.dropTable('users')
  await db.dropTable('sessions')
}

exports._meta = {
  version: 1,
}
