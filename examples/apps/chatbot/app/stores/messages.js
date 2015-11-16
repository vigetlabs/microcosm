import Eliza    from 'elizabot'
import Message  from '../records/message'
import sendChat from '../actions/sendChat'

const bot = new Eliza()

let Messages = {

  getInitialState() {
    return [ Message({ message: bot.getInitial(), user: 'Eliza' }) ]
  },

  add(state, message) {
    return state.concat(message)
  },

  deserialize(state) {
    return state
  },

  register() {
    return {
      [sendChat] : Messages.add
    }
  }

}

export default Messages
