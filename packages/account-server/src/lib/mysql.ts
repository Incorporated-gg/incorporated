import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function query(sql: string, args?: any | any[]): Promise<any> {
  const res = await pool.query(sql, args)
  return res[0]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function selectOne(sql: string, args?: any | any[]): Promise<any> {
  const res = await query(sql, args)
  return res[0]
}

export default {
  query,
  selectOne,
}
