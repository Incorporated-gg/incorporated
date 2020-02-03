import express from 'express'
import authMiddleware from './auth-middleware'
import { setupRoutes } from './routes'
import bodyParser from 'body-parser'
const app: express.Application = express()
const server = require('http').Server(app)

require('./express-async-errors-patch')
app.disable('x-powered-by')

// Parse application/json
app.use(bodyParser.json())

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Allow', 'GET, POST, OPTIONS')
  next()
})

// OPTIONS middleware
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }
  next()
})

// Auth middleware
authMiddleware(app)

// Our routes
setupRoutes(app)

// 404
app.all('*', function(req, res) {
  res.status(404).json({ error: '404 Not Found' })
})

// Errors middleware
function errorHandler(err: Error, req: express.Request, res: express.Response): void {
  console.error(err.stack)
  res.status(500).json({ error: 'Error 500: Algo salió mal' })
}
app.use(errorHandler)

server.listen(3001, () => {
  console.log('Server listening on port 3001!')
})
