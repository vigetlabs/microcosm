/**
 * This is the main server entry point into the
 * chatbot example.
 */

import Chat     from './app/components/chat'
import ChatBot  from './app/chatbot'
import DOM      from 'react-dom/server'
import Elizabot from 'elizabot'
import Message  from './app/records/message'
import React    from 'react'

const bot  = new Elizabot()

export default function register (server, _options, next) {

  server.route([
    {
      method : 'GET',
      path   : '/',
      handler(request, reply) {
        var app = new ChatBot()

        app.start(function(error) {
          if (error) {
            throw error
          }

          return reply.view('apps/chatbot/index', {
            markup  : DOM.renderToString(React.createElement(Chat, { app })),
            payload : JSON.stringify(app)
          })
        })
      }
    },
    {
      method : 'POST',
      path   : '/message',
      handler(request, reply) {
        let answer = Message({
          message : bot.transform(request.payload),
          user    : 'Eliza'
        })

        // Delay the response so that optimistic updates
        // are easier to notice.
        setTimeout(reply, 1500, answer)
      }
    }
  ])

  next()

}

register.attributes = {
  name        : 'Chatbot',
  description : 'A chatbot app that demonstrates optimistic updates.',
  example     : true,
  path        : '/chat-bot'
}
