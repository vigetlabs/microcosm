import Hydrate   from './app/plugins/hydrate'
import Render    from './app/plugins/render'
import SimpleSVG from './app/simple-svg'

let app = new SimpleSVG()

app.addPlugin(Hydrate, 'SIMPLE_SVG_SEED')
app.addPlugin(Render, document.getElementById('app'))

app.start()
