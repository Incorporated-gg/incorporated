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
  await db.removeColumn('alliances_members', 'permission_send_circular_msg')
  await db.removeColumn('alliances_members', 'permission_extract_troops')
  await db.removeColumn('alliances_members', 'permission_declare_war')
  await db.renameColumn('alliances_members', 'permission_extract_money', 'permission_extract_resources')
}

exports.down = async function(db) {
  // sorry not gonna bother
}

exports._meta = {
  version: 1,
}
