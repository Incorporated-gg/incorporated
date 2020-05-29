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
  await db.addColumn('alliances', 'server_points', {
    type: 'int',
    length: 11,
    notNull: true,
    defaultValue: 0,
  })
  await db.runSql(
    'UPDATE alliances SET server_points=(SELECT MAX(server_points) FROM users WHERE id IN (SELECT user_id FROM alliances_members WHERE alliances_members.alliance_id=alliances.id))'
  )
  await db.runSql('DELETE FROM hoods WHERE owner IS NULL')
  await db.removeColumn('users', 'server_points')
}

exports.down = async function(db) {
  throw new Error('Not implemented')
}

exports._meta = {
  version: 1,
}
