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
  await db.changeColumn('missions', 'result', {
    type: 'string',
    length: 20,
    notNull: false,
  })
}

exports.down = async function(db) {
  await db.changeColumn('missions', 'result', {
    type: 'string',
    length: 20,
    notNull: true,
  })
}

exports._meta = {
  version: 1,
}
