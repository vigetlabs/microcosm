/**
 * This is the main server entry point into the
 * chatbot example.
 */

import React    from 'react'
import DOM      from 'react-dom/server'
import Chat     from './app/presenters/chat'
import ChatBot  from './app/chatbot'
import template from './template.html'

export default function render (locals, next) {
  const app = new ChatBot()

  const markup = DOM.renderToString(<Chat app={ app } />)
  const output = template({ markup, payload: JSON.stringify(app) })

  next(null, output)
}
