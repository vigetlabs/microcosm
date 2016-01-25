import Render   from './app/plugins/render'
import UndoTree from './app/undo-tree'
import Debugger from 'microcosm-debugger'

let app = new UndoTree()

app.addPlugin(Debugger)
app.addPlugin(Render, document.getElementById('app'))

app.start()
