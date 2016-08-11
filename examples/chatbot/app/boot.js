import React       from 'react'
import DOM         from 'react-dom'
import Debugger    from 'microcosm-debugger'
import Microcosm   from '../../../src/microcosm'
import Messages    from './stores/messages'
import Chat        from './presenters/chat'

const repo = new Microcosm({ maxHistory: Infinity })

/**
 * Setup stores
 */
repo.addStore('messages', Messages)


/**
 * Enable the time-travel debugger.
 */
Debugger(repo)


/**
 * When the repo starts, render the user interface to the
 * provided DOM location.
 */
DOM.render(<Chat repo={ repo } />, document.getElementById('app'))
