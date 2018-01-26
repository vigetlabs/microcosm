/**
 * Connect a component to the presenter tree
 */

import { h } from 'preact'
import { merge } from 'microcosm'

export function withSend(Component) {
  function Sender(props, context) {
    return h(Component, merge({ send: context.send }, props))
  }

  let name = Component.displayName || Component.name || 'Component'

  Sender.displayName = `withSend(${name})`
  Sender.WrappedComponent = Component

  return Sender
}
