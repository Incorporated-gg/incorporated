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
  await db.addColumn('hoods', 'last_owner_change_at', {
    type: 'int',
    length: 11,
    unsigned: true,
  })
  await db.addColumn('hoods', 'level', {
    type: 'int',
    length: 11,
    unsigned: true,
  })
  await db.addColumn('users', 'server_points', {
    type: 'int',
    length: 11,
    unsigned: true,
    defaultValue: 0,
  })
}

exports.down = async function(db) {
  await db.removeColumn('hoods', 'last_owner_change_at')
  await db.removeColumn('hoods', 'level')
  await db.removeColumn('users', 'server_points')
}

exports._meta = {
  version: 1,
}
