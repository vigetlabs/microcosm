import Databank from '../../../../src/addons/databank'
import Message from '../records/message'
import { send } from '../actions/messages'

class Messages extends Databank {

  getInitialState () {
    const initial = Message({
      user: 'Eliza',
      message: "What's new with you?"
    })

    return [ 'put', initial.id, initial ]
  }

  add (state, items) {
    return [].concat(items)
             .map(item => ['put', item.id, Message(item)])
  }

  addLoading (state, params) {
    return [
      this.add(state, params),
      ['patch', params.id, 'loading', true],
    ]
  }

  addError (state, params) {
    return [
      this.add(state, params),
      ['patch', params.id, 'error', true],
    ]
  }

  comparator (a, b) {
    return a.time > b.time ? 1 : -1
  }

  register() {
    return {
      [send.open]  : this.addLoading,
      [send.done]  : this.add,
      [send.error] : this.addError
    }
  }

}

export default Messages
