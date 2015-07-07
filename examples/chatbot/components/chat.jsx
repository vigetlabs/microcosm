import Conversation from './conversation'
import Form from './form'
import React from 'react'
import sendChat from '../actions/sendChat'

export default React.createClass({

  render() {
    const { app, messages } = this.props
    const say = messages.filter(m => m.user === 'Eliza').pop()

    return (
      <div className="chat">
        <div className="audible" aria-live="polite">
          { say.user + ' said: ' + say.message }
        </div>
        <Conversation messages={ messages } />
        <Form onSubmit={ app.prepare(sendChat) } />
      </div>
    )
  }

})
