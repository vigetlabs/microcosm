import Messages  from './stores/messages'
import Microcosm from '../../../src/Microcosm'

class ChatBot extends Microcosm {

  constructor() {
    super()
    this.addStore('messages', Messages)
  }

}

export default ChatBot
