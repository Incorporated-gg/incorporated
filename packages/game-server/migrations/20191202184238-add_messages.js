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
  await db.createTable('messages', {
    id: { type: 'int', length: 11, unsigned: true, notNull: true, autoIncrement: true, primaryKey: true },
    user_id: { type: 'int', length: 11, notNull: true },
    sender_id: { type: 'int', length: 11 },
    created_at: { type: 'int', length: 11, notNull: true },
    type: { type: 'string', length: 20, notNull: true },
    data: { type: 'string', length: 2000, notNull: true },
  })
  await db.addIndex('messages', 'idx_user_id_created_at', ['user_id', 'created_at'])
  await db.addIndex('messages', 'idx_sender_id_created_at', ['sender_id', 'created_at'])
}

exports.down = async function(db) {
  await db.removeIndex('messages', 'idx_user_id_created_at')
  await db.removeIndex('messages', 'idx_sender_id_created_at')
  await db.dropTable('messages')
}

exports._meta = {
  version: 1,
}
