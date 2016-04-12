import Render   from './app/plugins/render'
import Painter  from './app/painter'
import Debugger from '../../../microcosm-debugger/dist/microcosm-debugger.js'

let app = new Painter({ maxHistory: Infinity })

app.addPlugin(Debugger)
app.addPlugin(Render, document.getElementById('app'))

app.start()
