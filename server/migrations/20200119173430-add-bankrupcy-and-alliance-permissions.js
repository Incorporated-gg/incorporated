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
  await db.addColumn('users', 'last_bankrupcy_at', { type: 'int', length: 11, unsigned: true })
  await db.renameColumn('alliances_members', 'is_admin', 'permission_admin')
  await db.addColumn('alliances_members', 'permission_accept_and_kick_members', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.addColumn('alliances_members', 'permission_extract_money', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.addColumn('alliances_members', 'permission_extract_troops', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.addColumn('alliances_members', 'permission_send_circular_msg', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.addColumn('alliances_members', 'permission_activate_buffs', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.addColumn('alliances_members', 'permission_declare_war', {
    type: 'boolean',
    defaultValue: false,
    notNull: true,
  })
  await db.runSql(
    'UPDATE alliances_members SET permission_accept_and_kick_members=1, permission_extract_money=1, permission_extract_troops=1, \
  permission_send_circular_msg=1, permission_activate_buffs=1, permission_declare_war=1 WHERE permission_admin=1'
  )
  await db.createTable('users_daily_log', {
    server_day: { type: 'smallint', length: 11, unsigned: true, notNull: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    daily_income: { type: 'int', length: 11, unsigned: true, notNull: true },
  })
  await db.addIndex('users_daily_log', 'idx_user_id_server_day', ['user_id', 'server_day'])
}

exports.down = async function(db) {
  await db.removeColumn('users', 'last_bankrupcy_at')
  await db.renameColumn('alliances_members', 'permission_admin', 'is_admin')
  await db.removeColumn('alliances_members', 'permission_accept_and_kick_members')
  await db.removeColumn('alliances_members', 'permission_extract_money')
  await db.removeColumn('alliances_members', 'permission_extract_troops')
  await db.removeColumn('alliances_members', 'permission_send_circular_msg')
  await db.removeColumn('alliances_members', 'permission_activate_buffs')
  await db.removeColumn('alliances_members', 'permission_declare_war')
  await db.removeIndex('users_daily_log', 'idx_user_id_server_day')
  await db.dropTable('users_daily_log')
}

exports._meta = {
  version: 1,
}
