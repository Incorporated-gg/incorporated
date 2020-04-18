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
  await db.renameColumn('users', 'last_bankrupcy_at', 'bankrupcy_started_at')
}

exports.down = async function(db) {
  await db.renameColumn('users', 'bankrupcy_started_at', 'last_bankrupcy_at')
}

exports._meta = {
  version: 1,
}
