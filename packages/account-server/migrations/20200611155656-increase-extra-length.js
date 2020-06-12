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
  await db.changeColumn('users_activity_log', 'extra', {
    type: 'text',
    notNull: false,
  })
}

exports.down = async function(db) {
  await db.changeColumn('users_activity_log', 'extra', {
    type: 'string',
    length: 255,
    notNull: false,
  })
}

exports._meta = {
  version: 1,
}
