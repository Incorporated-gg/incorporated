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
  await db.createTable('hoods', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, unique: true },
    owner: { type: 'int', length: 11, unsigned: true },
    guards: { type: 'decimal', length: '64, 4', notNull: true },
  })
}

exports.down = async function(db) {
  await db.dropTable('hoods')
}

exports._meta = {
  version: 1,
}
