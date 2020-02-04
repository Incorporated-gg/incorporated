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
  await db.dropTable('sessions')
  await db.removeColumn('users', 'id')
  await db.removeColumn('users', 'email')
  await db.removeColumn('users', 'password')
  await db.addColumn('users', 'id', { type: 'int', length: 11, unsigned: true, unique: true })
}

exports.down = async function(db) {
  throw new Error('No undoing this one')
}

exports._meta = {
  version: 1,
}
