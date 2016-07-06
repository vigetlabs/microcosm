import React     from 'react'
import DOM       from 'react-dom'
import Debugger  from 'microcosm-debugger'
import Painter   from './painter'
import Workspace from './presenters/workspace'

const app = new Painter({ maxHistory: Infinity })

Debugger(app)

DOM.render(<Workspace app={ app } />, document.querySelector('#app'))
