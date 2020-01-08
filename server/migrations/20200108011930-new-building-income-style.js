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
  await db.addColumn('buildings', 'money', { type: 'decimal', length: '64, 4', unsigned: true, notNull: true })
}

exports.down = async function(db) {
  await db.removeColumn('buildings', 'money')
}

exports._meta = {
  version: 1,
}
