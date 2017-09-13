/**
 * @fileoverview This is the devtools script, which is called when the user opens the
 * Chrome devtool on a page. We check to see if we global hook has detected
 * Microcosm presence on the page. If yes, create the Microcosm panel; otherwise poll
 * for 10 seconds.
 */

let created = false
let checkCount = 0

chrome.devtools.network.onNavigated.addListener(createPanelIfHasMicrocosm)

const checkMicrocosmInterval = setInterval(createPanelIfHasMicrocosm, 1000)

createPanelIfHasMicrocosm()

function createPanelIfHasMicrocosm() {
  if (created || checkCount++ > 10) {
    return
  }

  let test = '!!(window.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__.repo)'

  chrome.devtools.inspectedWindow.eval(test, function(ready) {
    if (!ready || created) {
      return
    }

    clearInterval(checkMicrocosmInterval)

    created = true

    chrome.devtools.panels.create(
      'Microcosm',
      'icons/128.png',
      'devtools.html',
      function(panel) {
        // panel loaded
      }
    )
  })
}
