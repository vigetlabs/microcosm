const Chat = require('./chat')
const bodyParser = require('body-parser')

module.exports = function(app) {
  let bot = Chat.start()

  app.use(bodyParser.json())

  app.post('/message', function(req, res) {
    // Simulate latency
    setTimeout(function() {
      res.send(Chat.parse(bot, req.body.message))
    }, 500 + Math.random() * 500)
  })
}
