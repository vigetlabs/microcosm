/**
 * This is the main server entry point into the
 * chatbot example.
 */

import Chat     from './app/components/chat'
import ChatBot  from './app/chatbot'
import DOM      from 'react-dom/server'
import Elizabot from 'elizabot'
import React    from 'react'
import uid      from 'uid'

const bot = new Elizabot()

export function answer (request, reply) {
  return reply({
    id      : uid(),
    message : bot.transform(request.payload),
    time    : new Date(),
    user    : 'Eliza'
  })
}

export function render (request, reply) {
  var app = new ChatBot()

  app.start(function(error) {
    if (error) {
      return reply(error).code(500)
    }

    return reply.view('apps/chatbot/index', {
      markup  : DOM.renderToString(React.createElement(Chat, { app })),
      payload : JSON.stringify(app)
    })
  })
}

export default function register (server, _options, next) {

  server.route([
    {
      method  : 'GET',
      path    : '/chatbot',
      handler : render
    },
    {
      method  : 'POST',
      path    : '/chatbot/message',
      handler : answer
    }
  ])

  next()

}

register.attributes = {
  name        : 'Chatbot',
  description : 'A chatbot app that demonstrates optimistic updates.',
  example     : true,
  path        : '/chatbot'
}
