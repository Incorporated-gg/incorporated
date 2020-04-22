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
  await db.createTable('cron_day_changes_done', {
    day: { type: 'int', length: 11, unsigned: true, notNull: true, unique: true },
  })
  await db.runSql('INSERT INTO cron_day_changes_done (day) VALUES (104)')
  await db.addColumn('users_daily_log', 'researchs_count', {
    type: 'int',
    length: 11,
    unsigned: true,
    notNull: true,
  })
}

exports.down = async function(db) {
  await db.dropTable('cron_day_changes_done')
  await db.removeColumn('users_daily_log', 'researchs_count')
}

exports._meta = {
  version: 1,
}
