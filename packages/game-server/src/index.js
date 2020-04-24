import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import { setupRoutes } from './routes'
import { setupChat } from './chat'
import setupCron from './crons'
import './express-async-errors-patch'

// Parse application/json
import bodyParser from 'body-parser'

const app = express()
const server = http.Server(app)
const io = socketIO.listen(server).path('/api/socket.io')
app.disable('x-powered-by')
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
require('./auth-middleware')(app)

// Our routes
setupRoutes(app)

// Setup chat
setupChat(io)

// 404
app.all('*', function(req, res) {
  res.status(404).json({ error: '404 Not Found' })
})

// Errors middleware
app.use(errorHandler)
function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({ error: 'Error 500: Algo salió mal' })
}

server.listen(3101, () => {
  console.log('Server listening on port 3101!')
})

// Setup crons
setupCron()
