import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Messenger from '../views/messenger'

export default class ChatPresenter extends Presenter {

  model () {
    return {
      messages : state => state.messages
    }
  }

  view ({ messages }) {
    return <Messenger messages={ messages } />
  }

}
