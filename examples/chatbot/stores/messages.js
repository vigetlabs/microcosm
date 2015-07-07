import sendChat from '../actions/sendChat'
import bot from '../lib/bot'

function getInitialState() {
  return [{
    message : bot.getInitial(),
    user    : 'Eliza',
    time    : new Date()
  }]
}

function add(state, message) {
  return state.concat(message)
}

function register() {
  return {
    [sendChat] : add
  }
}

export default { getInitialState, register }
