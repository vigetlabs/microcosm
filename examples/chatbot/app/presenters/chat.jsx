import Presenter from '../../../../src/addons/presenter'
import Messenger from '../views/messenger'

export default class ChatPresenter extends Presenter {
  view = Messenger

  model () {
    return {
      messages : state => state.messages
    }
  }
}
