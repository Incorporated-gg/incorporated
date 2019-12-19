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
  await db.renameColumn('missions', 'won', 'result')
  await db.changeColumn('missions', 'result', {
    type: 'string',
    length: 20,
    notNull: true,
  })
  await db.runSql('UPDATE missions SET result="draw"')
}

exports.down = async function(db) {
  await db.renameColumn('missions', 'result', 'won')
  await db.changeColumn('missions', 'won', { type: 'boolean', notNull: false })
}

exports._meta = {
  version: 1,
}
