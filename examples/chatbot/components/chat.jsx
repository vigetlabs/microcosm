import Conversation from './conversation'
import Form from './form'
import React from 'react'
import sendChat from '../actions/sendChat'

export default React.createClass({

  render() {
    const { app, messages} = this.props

    return (
      <div className="chat">
        <Conversation messages={ messages } />
        <Form onSubmit={ app.prepare(sendChat) } />
      </div>
    )
  }

})
