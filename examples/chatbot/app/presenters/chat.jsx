import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Messenger from '../views/messenger'
import { send }  from '../actions/messages'

export default class ChatPresenter extends Presenter {

  register () {
    return {
      sendChat : (repo, data) => repo.push(send, data)
    }
  }

  model () {
    return {
      messages : state => state.messages
    }
  }

  view ({ messages }) {
    return <Messenger messages={ messages } />
  }

}
