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
  await db.addColumn('users', 'money', { type: 'bigint', length: 11, unsigned: true, notNull: true })
  await db.addColumn('users', 'last_money_update', { type: 'int', length: 11, unsigned: true, notNull: true })
  await db.createTable('buildings', {
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    id: { type: 'int', length: 2, unsigned: true, notNull: true },
    quantity: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
}

exports.down = async function(db) {
  await db.removeColumn('users', 'money')
  await db.removeColumn('users', 'last_money_update')
  await db.dropTable('buildings')
}

exports._meta = {
  version: 1,
}
