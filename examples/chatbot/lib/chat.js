import Eliza   from 'elizabot'
import Promise from 'promise'
import uid     from 'uid'

export const Bot = new Eliza()

const COMMANDS = {

  error(message) {
    let answer  = { user: 'You', id: uid(), message }

    return new Promise(function (resolve, reject) {
      setTimeout(() => reject(answer), 1000)
    })
  },

  reply(message) {
    let answer  = [
      { user: 'You',   id: uid(), message: message },
      { user: 'Eliza', id: uid(), message: Bot.transform(message) }
    ]

    return new Promise(function (resolve, reject) {
      setTimeout(() => resolve(answer), 1500)
    })
  },

  unknown(message) {
    return Promise.reject({
      user    : 'System',
      message : `Unknown command “${ message }”`,
      error   : true
    })
  }

}

export function say (message) {
  let command = message.match(/^\/(\w+)\s*(.*)/)

  if (command) {
    let [_, action, options ] = command

    if (action in COMMANDS) {
      return COMMANDS[action](options)
    } else {
      return COMMANDS.unknown(action)
    }
  }

  return COMMANDS.reply(message)
}
