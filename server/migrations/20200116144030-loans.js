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
  await db.createTable('loans', {
    created_at: { type: 'int', length: 11, unsigned: true, notNull: true },
    lender_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    interest_rate: { type: 'tinyint', length: 2, unsigned: true, notNull: true },
    money_amount: { type: 'int', length: 11, unsigned: true, notNull: true },
    borrower_id: { type: 'int', length: 11, unsigned: true },
    loan_started_at: { type: 'int', length: 11, unsigned: true },
  })
  await db.addIndex('loans', 'idx_lender_id', ['lender_id'])
  await db.addIndex('loans', 'idx_borrower_id', ['borrower_id'])
}

exports.down = async function(db) {
  await db.removeIndex('loans', 'idx_lender_id')
  await db.removeIndex('loans', 'idx_borrower_id')
  await db.dropTable('loans')
}

exports._meta = {
  version: 1,
}
