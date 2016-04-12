import Hydrate   from './app/plugins/hydrate'
import Render    from './app/plugins/render'
import SimpleSVG from './app/simple-svg'

let app = new SimpleSVG()

Hydrate(app, 'SIMPLE_SVG_SEED')
Render(app, document.getElementById('app'))
