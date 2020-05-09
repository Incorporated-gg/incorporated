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
  await db.addColumn('users', 'attacks_left', {
    type: 'tinyint',
    length: 11,
    unsigned: true,
    notNull: true,
  })
  await db.runSql('UPDATE users SET attacks_left=3')
}

exports.down = async function(db) {
  await db.removeColumn('users', 'attacks_left')
  // sorry not gonna bother
}

exports._meta = {
  version: 1,
}
