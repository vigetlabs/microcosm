import Announcer from './announcer'
import Conversation from './conversation'
import Form from './form'
import React from 'react'
import sendChat from '../actions/sendChat'

export default React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  render() {
    const { app } = this.props
    const { messages } = app.state

    const toSay = messages.filter(m => m.user !== 'You').pop()

    return (
      <div className="chat">
        <Conversation messages={ messages } />
        <Form onSubmit={ app.prepare(sendChat) } />
        <Announcer { ...toSay } />
      </div>
    )
  }

})
