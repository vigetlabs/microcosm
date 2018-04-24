import React from 'react'
import { Presenter } from 'microcosm-dom'
import Messenger from './parts/messenger'

export default class ChatPresenter extends Presenter {
  getModel(repo) {
    return {
      messages: repo.domains.messages
    }
  }

  render() {
    return <Messenger messages={this.model.messages} />
  }
}
