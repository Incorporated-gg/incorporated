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
  await db.runSql('UPDATE users SET tutorial_task_data=NULL')
  await db.renameColumn('users', 'tutorial_task_data', 'task_data')
  await db.addColumn('alliances', 'badge_json', {
    type: 'string',
    length: 500,
  })
}

exports.down = async function(db) {
  await db.renameColumn('users', 'task_data', 'tutorial_task_data')
  await db.removeColumn('alliances', 'badge_json')
}

exports._meta = {
  version: 1,
}
