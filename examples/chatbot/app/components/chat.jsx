import Announcer from './announcer'
import Conversation from './conversation'
import Form from './form'
import React from 'react'
import sendChat from '../actions/sendChat'

export default React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  sendChat(body) {
    return this.props.app.push(sendChat, body)
  },

  render() {
    const { messages } = this.props.app.state

    const toSay = messages.filter(m => m.user !== 'You').pop()

    return (
      <div className="chat">
        <Conversation messages={ messages } />
        <Form onSubmit={ this.sendChat } />
        <Announcer { ...toSay } />
      </div>
    )
  }

})
