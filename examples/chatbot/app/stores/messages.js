import Message  from '../records/message'
import sendChat from '../actions/sendChat'

import { Bot } from '../../lib/chat'

let Messages = {

  getInitialState() {
    return [ Message({ user: 'Eliza', message: Bot.getInitial() }) ]
  },

  add(state, message) {
    return state.concat(message)
  },

  addLoading(state, message) {
    return this.add(state, Message({ message, user: 'You', pending: true }))
  },

  addError(state, error) {
    return this.add(state, Message({ ...error, error: true }))
  },

  register() {
    return {
      [sendChat.open]    : Messages.addLoading,
      [sendChat.done]    : Messages.add,
      [sendChat.failed]  : Messages.addError
    }
  }

}

export default Messages
