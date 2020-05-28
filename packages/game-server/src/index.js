import express from 'express'
import http from 'http'
import compression from 'compression'
import socketIO from 'socket.io'
import './express-async-errors-patch'
import bodyParser from 'body-parser'
import { getServerDay } from './lib/serverTime'
import { setupRoutes } from './routes'
import { setupChat } from './chat'

const serverDay = getServerDay()
if (serverDay <= 0) {
  console.warn(`[game-server] To avoid bugs, the first playable day should be 1. The current day is ${serverDay}`)
}

const app = express()
const server = http.Server(app)

app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(compression())

// HTTP headers
app.use((req, res, next) => {
  // CORS
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Allow', 'GET, POST, OPTIONS')

  // Misc
  res.header('Cache-Control', 'no-cache no-transform')

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
const io = socketIO.listen(server).path('/api/socket.io')
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

const port = 3101
server.listen(port, () => {
  console.log(`Game-server http server listening on port ${port}!`)
})
