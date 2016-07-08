import React     from 'react'
import Presenter from 'microcosm/addons/presenter'
import Messenger from '../views/messenger'
import { send }  from '../actions/messages'

export default class ChatPresenter extends Presenter {

  sendChat(app, { message }) {
    return app.push(send, message)
  }

  viewModel() {
    return {
      messages : state => state.messages
    }
  }

  render() {
    return <Messenger messages={ this.state.messages } />
  }

}
