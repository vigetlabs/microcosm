import Microcosm from 'microcosm'
import Messages from './domains/messages'

class Repo extends Microcosm {
  setup () {
    this.addDomain('messages', Messages)
  }
}

export default Repo
