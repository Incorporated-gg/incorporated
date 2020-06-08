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
  await db.removeColumn('alliances_wars', 'alliance1_hoods')
  await db.removeColumn('alliances_wars', 'alliance2_hoods')
}

exports.down = async function(db) {
  throw new Error('Not implemented')
}

exports._meta = {
  version: 1,
}
