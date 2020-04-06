'use strict'
/* eslint-disable no-unused-vars */

let dbm
let type
let seed

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
  await db.addColumn('users', 'level', {
    type: 'smallint',
    length: 11,
    defaultValue: 1,
    unsigned: true,
    notNull: true,
  })
  await db.addColumn('users', 'xp', {
    type: 'int',
    length: 11,
    defaultValue: 0,
    unsigned: true,
    notNull: true,
  })
}

exports.down = async function(db) {
  await db.removeColumn('users', 'level')
  await db.removeColumn('users', 'xp')
}

exports._meta = {
  version: 1,
}
