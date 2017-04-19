var Eliza = require('elizabot')
var uid = require('uid')

var COMMANDS = {
  error (bot, message) {
    return { id: uid(), error: true, user: 'You', message }
  },

  reply (bot, message) {
    return [
      { id: uid(), user: 'You', message: message },
      { id: uid(), user: 'Eliza', message: bot.transform(message) },
    ]
  },

  unknown (bot, message) {
    return {
      id:      uid(),
      user:    'System',
      message: `Unknown command “${message}”`,
      error:   true,
    }
  },
}

exports.start = function () {
  return new Eliza()
}

exports.greet = function (bot) {
  return { id: uid(), user: 'Eliza', message: bot.getInitial() }
}

exports.parse = function parse (bot, message) {
  var command = message.match(/^\/(\w+)\s*(.*)/)

  if (command) {
    var action = command[1]
    var options = command[2]

    if (action in COMMANDS) {
      return COMMANDS[action](bot, options)
    } else {
      return COMMANDS.unknown(bot, action)
    }
  }

  return COMMANDS.reply(bot, message)
}
