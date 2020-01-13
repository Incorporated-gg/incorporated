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
  await db.addColumn('alliances', 'buff_attack_last_used', {
    type: 'int',
    length: 11,
    unsigned: true,
    notNull: false,
  })
  await db.addColumn('alliances', 'buff_defense_last_used', {
    type: 'int',
    length: 11,
    unsigned: true,
    notNull: false,
  })
}

exports.down = async function(db) {
  await db.removeColumn('alliances', 'buff_attack_last_used')
  await db.removeColumn('alliances', 'buff_defense_last_used')
}

exports._meta = {
  version: 1,
}
