/**
 * Browser entrypoint for the ChatBot example
 */

import ChatBot  from './app/chatbot'
import Hydrate  from './app/plugins/hydrate'
import Render   from './app/plugins/render'
import Debugger from '../../../microcosm-debugger/dist/microcosm-debugger'

let chat = new ChatBot({ maxHistory: Infinity })

Debugger(chat)

/**
 * When the application starts, reset state to the serialized
 * data from the server. See index.js to learn how this state
 * is generated.
 */
Hydrate(chat, 'CHAT_BOT_SEED')


/**
 * When the application starts, render the user interface to the
 * provided DOM location.
 */
Render(chat, document.getElementById('app'))
