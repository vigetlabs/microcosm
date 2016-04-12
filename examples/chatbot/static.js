/**
 * This is the main server entry point into the
 * chatbot example.
 */

import Chat     from './app/components/chat'
import ChatBot  from './app/chatbot'
import DOM      from 'react-dom/server'
import React    from 'react'
import template from './template.html'

export default function render (locals, next) {
  let app = new ChatBot()

  let markup = DOM.renderToString(React.createElement(Chat, { app }))
  let output = template({ markup, payload: JSON.stringify(app) })

  next(null, output)
}
