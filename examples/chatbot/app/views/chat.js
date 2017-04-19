import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import Messenger from './parts/messenger'

export default class ChatPresenter extends Presenter {
  getModel () {
    return {
      messages: state => state.messages,
    }
  }

  render () {
    return <Messenger messages={this.model.messages} />
  }
}
