/**
 * @fileoverview This script is called when the dev tools panel is activated.
 */

import { initDevTools } from '../../../src/devtools'
import Bridge from '../../../src/bridge'

initDevTools({
  connect(callback) {
    // 1. build and hook up window-to-Microcosm bridge
    injectScript(chrome.runtime.getURL('build/backend.js'), () => {
      // 2. connect to background to setup proxy
      const port = chrome.runtime.connect({
        name: '' + chrome.devtools.inspectedWindow.tabId
      })

      let disconnected = false
      port.onDisconnect.addListener(() => {
        disconnected = true
      })

      // 3. build devTools-to-window bridge
      const bridge = new Bridge({
        listen(fn) {
          port.onMessage.addListener(fn)
        },
        send(data) {
          if (!disconnected) {
            port.postMessage(data)
          }
        }
      })

      // 4. wire up devTools-to-window bridge
      callback(bridge)
    })

    chrome.devtools.network.onNavigated.addListener(() =>
      this.connect(callback)
    )
  }
})

/**
 * Inject a globally evaluated script, in the same context with the actual
 * user app.
 *
 * @param {String} scriptName
 * @param {Function} cb
 */
function injectScript(scriptName, cb) {
  const src = `
    var script = document.constructor.prototype.createElement.call(document, 'script');
    script.src = "${scriptName}";
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  `
  chrome.devtools.inspectedWindow.eval(src, function(res, err) {
    if (err) {
      // eslint-disable-next-line
      console.log(err)
    }

    cb()
  })
}
