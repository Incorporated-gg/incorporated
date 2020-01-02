module.exports = app => {
  require('./alliances/basic')(app)
  require('./alliances/member_request')(app)
  require('./alliances/admin')(app)
}
