import Render   from './app/plugins/Render'
import UndoTree from './app/undo-tree'

let app = new UndoTree()

app.addPlugin(Render, document.getElementById('app'))

app.start()
