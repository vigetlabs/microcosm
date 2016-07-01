import React     from 'react'
import Presenter from 'microcosm/addons/presenter'
import Messenger from '../views/messenger'
import sendChat  from '../actions/sendChat'

export default class Chat extends Presenter {

  sendChat(app, { message }) {
    return app.push(sendChat, message)
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
