module.exports.setupRoutes = app => {
  app.get('/', function (req, res) {
    res.send('Hello World!')
  })
}
