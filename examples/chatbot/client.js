/**
 * Browser entrypoint for the ChatBot example
 */

import React    from 'react'
import DOM      from 'react-dom'
import Debugger from 'microcosm-debugger'
import ChatBot  from './app/chatbot'
import Chat     from './app/presenters/chat'

const app = new ChatBot({ maxHistory: Infinity })

Debugger(app)

/**
 * When the application starts, reset state to the serialized
 * data from the server. See index.js to learn how this state
 * is generated.
 */
app.replace(window['CHAT_BOT_SEED'])


/**
 * When the application starts, render the user interface to the
 * provided DOM location.
 */
DOM.render(<Chat app={ app } />, document.getElementById('app'))
