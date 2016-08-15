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
      sendChat : (repo, data) => repo.push(send, data)
    }
  }

  render() {
    return <Messenger messages={ this.state.messages } />
  }

}
