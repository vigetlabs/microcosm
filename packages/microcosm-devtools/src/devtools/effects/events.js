/**
 * @fileoverview Handle all bridge communication through this effect
 */

import { updateHistory } from '../actions/history'
import { updateSnapshot } from '../actions/snapshot'

class Events {
  setup(repo, { bridge }) {
    this.bridge = bridge

    bridge.once('ready', version => {
      // TODO: Show version number in UI
    })

    bridge.once('proxy-fail', () => {
      // TODO: Signal error in UI
    })

    bridge.on('history:reconcile', repo.prepare(updateHistory))
    bridge.on('history:release', repo.prepare(updateSnapshot))
    bridge.on('snapshot', repo.prepare(updateSnapshot))
  }

  teardown() {
    this.bridge.removeAllListeners()
  }

  toggle(repo, id) {
    this.bridge.send(`toggle:${id}`)
  }

  remove(repo, id) {
    this.bridge.send(`remove:${id}`)
  }

  checkout(repo, id) {
    this.bridge.send(`checkout:${id}`)
  }

  revert(repo) {
    this.bridge.send(`revert`)
  }

  commit(repo) {
    this.bridge.send(`commit`)
  }

  detail(repo, id) {
    this.bridge.send(`detail:${id}`)
  }

  register() {
    return {
      ['toggle']: this.toggle,
      ['remove']: this.remove,
      ['checkout']: this.checkout,
      ['revert']: this.revert,
      ['commit']: this.commit,
      ['detail']: this.detail
    }
  }
}

export default Events
