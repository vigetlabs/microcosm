import { Domain } from 'microcosm'
import Message from '../records/message'
import { send } from '../actions/messages'

class Messages extends Domain {
  getInitialState() {
    return [Message({ user: 'Eliza', message: "What's new with you?" })]
  }

  add(state, items) {
    const messages = [].concat(items).map(Message)

    return state.concat(messages)
  }

  addLoading(state, params) {
    return this.add(state, { ...params, user: 'You', pending: true })
  }

  addError(state, params) {
    return this.add(state, { ...params, error: true })
  }

  register() {
    return {
      [send]: {
        next: this.addLoading,
        complete: this.add,
        error: this.addError
      }
    }
  }
}

export default Messages
