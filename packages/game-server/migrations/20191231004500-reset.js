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
  await db.runSql('DELETE FROM buildings')
  await db.runSql('DELETE FROM research')
  await db.runSql('DELETE FROM alliances_research')
  await db.runSql('DELETE FROM alliances_resources')
  await db.runSql('DELETE FROM users_resources')
  await db.runSql('DELETE FROM messages')
  await db.runSql('DELETE FROM monopolies')
  await db.runSql('UPDATE users SET money=450000')
}

exports.down = async function(db) {
  // Can't undo
}

exports._meta = {
  version: 1,
}
