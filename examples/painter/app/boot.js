import React     from 'react'
import DOM       from 'react-dom'
import Debugger  from 'microcosm-debugger'
import Painter   from './painter'
import Workspace from './presenters/workspace'

const repo = new Painter({ maxHistory: Infinity })

Debugger(repo)

DOM.render(<Workspace repo={ repo } />, document.querySelector('#app'))
