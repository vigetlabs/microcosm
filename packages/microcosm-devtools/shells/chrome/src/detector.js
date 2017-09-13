/**
 * @fileoverview This is how the dev tools detect Microcosm.
 * @todo This will always fire. How can we be smarter about enabling the plugin?
 */

window.addEventListener('message', e => {
  if (e.source === window && e.data.microcosmDetected) {
    chrome.runtime.sendMessage(e.data)
  }
})

function detect(win) {
  // TODO: Poll until we detect a Microcosm. We need a check here.
  setTimeout(() => {
    win.postMessage(
      {
        devtoolsEnabled: true,
        microcosmDetected: true
      },
      '*'
    )
  }, 100)
}

// inject the hook
const script = document.createElement('script')
script.textContent = ';(' + detect.toString() + ')(window)'
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
