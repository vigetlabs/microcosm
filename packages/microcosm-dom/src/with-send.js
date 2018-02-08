/**
 * Connect a component to the presenter tree
 */

import { merge } from 'microcosm'
import { noop } from './utilities'

const CONTEXT_TYPES = {
  send: noop
}

export function generateWithSend(createElement) {
  return function withSend(Component) {
    function Sender(props, context) {
      return createElement(Component, merge({ send: context.send }, props))
    }

    let name = Component.displayName || Component.name || 'Component'

    Sender.displayName = `withSend(${name})`
    Sender.contextTypes = CONTEXT_TYPES
    Sender.WrappedComponent = Component

    return Sender
  }
}
