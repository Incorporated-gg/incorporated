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
  await db.addColumn('alliances_resources_log', 'type', {
    type: 'string',
    length: 11,
    notNull: true,
  })
  await db.runSql('UPDATE alliances_resources_log SET type="extract" WHERE quantity<0')
  await db.runSql('UPDATE alliances_resources_log SET type="deposit" WHERE quantity>0')
  await db.runSql('UPDATE alliances_resources_log SET quantity=-quantity WHERE quantity<0')
}

exports.down = async function(db) {
  await db.runSql('UPDATE alliances_resources_log SET quantity=-quantity WHERE type="extract"')
  await db.removeColumn('alliances_resources_log', 'type')
}

exports._meta = {
  version: 1,
}
