/**
 * @flow
 */

import { type Subject } from './subject'
import { Agent } from './agent'

export class Effect extends Agent {
  receive(action: Subject) {
    action.every().subscribe(this._dispatch.bind(this))
  }

  _dispatch(action: Subject) {
    var handlers = this.registry.resolve(action)

    for (var i = 0, len = handlers.length; i < len; i++) {
      handlers[i].call(this, this.repo, action.payload)
    }
  }
}
