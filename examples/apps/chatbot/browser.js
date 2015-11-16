/**
 * Browser entrypoint for the ChatBot example
 */

import ChatBot from './app/chatbot'
import Hydrate from './app/plugins/hydrate'
import Render  from './app/plugins/render'

let chat = new ChatBot()


/**
 * When the application starts, reset state to the serialized
 * data from the server. See server.js to learn how this state
 * is generated.
 */
chat.addPlugin(Hydrate, 'CHAT_BOT_SEED')


/**
 * When the application starts, render the user interface to the
 * provided DOM location.
 */
chat.addPlugin(Render, document.getElementById('app'))


/**
 * Starting the application will run through each plugin in the
 * order that they were added. If any errors are in the process,
 * they are reported to the callback executed when it completes.
 */
chat.start(function(error) {
  if (error) {
    throw error
  }

  console.log('Chat application has started')
})
