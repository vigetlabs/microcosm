import { trackHistory } from './history'

const hook = window.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__

let bridge

export function initBackend(_bridge) {
  bridge = _bridge

  if (hook.repo) {
    connect()
  } else {
    hook.once('init', connect)
  }
}

function connect() {
  bridge.log('Microcosm devtools backend ready')

  bridge.send('ready', '12.9.0')

  trackHistory(hook, bridge)
}
