var express = require('express')
var assets  = require('./assets')
var Chat    = require('./chat')

var app  = express()
var port = process.env.PORT || 4000

app.use(assets())
app.use(express.static(__dirname + '/../public/'))
app.use(require('body-parser').json())

var bot = Chat.start()

app.post('/message', function (req, res) {

  // Simulate latency
  setTimeout(function() {
    res.send(Chat.parse(bot, req.body.message))
  }, 500 + Math.random() * 500)
})

app.listen(port, function () {
  console.log('ChatBot listening at http://localhost:%s', port)
})
