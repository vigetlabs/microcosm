import React from 'react'
import Announcer from './announcer'
import Conversation from './conversation'
import Prompt from './prompt'

export default function Messenger({ messages = [] }) {
  var toSay = messages.filter(m => m.user !== 'You').pop()

  return (
    <main className="chat">
      <Announcer {...toSay} />
      <Conversation messages={messages} />
      <Prompt />
    </main>
  )
}
