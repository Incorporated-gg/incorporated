module.exports.setupRoutes = app => {
  require('./login')(app)
  require('./register')(app)
  require('./my_data')(app)
}
