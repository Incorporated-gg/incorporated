import mysqlPromise from 'mysql2/promise'
const pool = mysqlPromise.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

function query(sql, args) {
  return pool.query(sql, args).then(res => res[0])
}
function selectOne(sql, args) {
  return pool.query(sql, args).then(res => res[0][0])
}

export default { query, selectOne }
