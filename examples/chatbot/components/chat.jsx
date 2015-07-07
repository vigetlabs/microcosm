import Conversation from './conversation'
import Form from './form'
import React from 'react'
import sendChat from '../actions/sendChat'

export default React.createClass({

  send(message) {
    this.props.app.push(sendChat, message)
  },

  render() {
    return (
      <div className="chat">
        <Conversation messages={ this.props.messages } />
        <Form onSubmit={ this.send } />
      </div>
    )
  }

})
