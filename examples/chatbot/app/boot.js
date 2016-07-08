import React       from 'react'
import DOM         from 'react-dom'
import Debugger    from 'microcosm-debugger'
import Microcosm   from 'microcosm'
import Messages    from './stores/messages'
import Chat        from './presenters/chat'

const app = new Microcosm({ maxHistory: Infinity })

/**
 * Setup stores
 */
app.addStore('messages', Messages)


/**
 * Enable the time-travel debugger.
 */
Debugger(app)


/**
 * When the application starts, render the user interface to the
 * provided DOM location.
 */
DOM.render(<Chat app={ app } />, document.getElementById('app'))
