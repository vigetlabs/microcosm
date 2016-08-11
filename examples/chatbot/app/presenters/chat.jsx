import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Messenger from '../views/messenger'
import { send }  from '../actions/messages'

export default class ChatPresenter extends Presenter {

  viewModel() {
    return {
      messages : state => state.messages
    }
  }

  register() {
    return {
      sendChat : this.sendChat
    }
  }

  sendChat(repo, { message }) {
    return repo.push(send, message)
  }

  render() {
    return <Messenger messages={ this.state.messages } />
  }

}
