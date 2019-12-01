'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.createTable('ranking', {
    id: { type: 'int', unsigned: true, primaryKey: true, autoIncrement: true },
    user_id: { type: 'int', length: 11, unsigned: true, notNull: true },
    income: { type: 'int', length: 11, unsigned: true, notNull: true, defaultValue: 0 },
  })
};

exports.down = async function(db) {
  await db.dropTable('ranking')
};

exports._meta = {
  version: 1,
};
