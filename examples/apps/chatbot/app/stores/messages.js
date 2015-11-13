import Eliza    from 'elizabot'
import sendChat from '../actions/sendChat'
import uid      from 'uid'

const Messages = {

  getInitialState() {
    return [{
      id      : uid(),
      message : new Eliza().getInitial(),
      user    : 'Eliza',
      time    : new Date()
    }]
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
