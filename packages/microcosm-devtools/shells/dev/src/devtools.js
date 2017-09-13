import { initDevTools } from 'src/devtools'
import Bridge from 'src/bridge'

const target = document.getElementById('target')
const targetWindow = target.contentWindow

// 1. load user app
target.src = 'target.html'
target.onload = () => {
  initDevTools({
    connect(callback) {
      // 2. build and hook up window-to-Microcosm bridge
      inject('./build/backend.js', () => {
        // 3. build devTools-to-window bridge
        var devToolsBridge = new Bridge({
          listen(fn) {
            targetWindow.parent.addEventListener('message', evt => fn(evt.data))
          },
          send(data) {
            targetWindow.postMessage(data, '*')
          }
        })

        // 4. wire up devTools-to-window bridge
        callback(devToolsBridge)
      })
    }
  })
}

function inject(src, done) {
  if (!src || src === 'false') {
    return done()
  }
  const script = target.contentDocument.createElement('script')
  script.src = src
  script.onload = done
  target.contentDocument.body.appendChild(script)
}
