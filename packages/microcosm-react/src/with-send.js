/**
 * Connect a component to the presenter tree
 */

import { createElement } from 'react'
import { merge } from 'microcosm'
import { noop } from './utilities'

function displayName(Component) {
  return Component.displayName || Component.name || 'Component'
}

const CONTEXT_TYPES = {
  send: noop
}

export function withSend(Component) {
  function Sender(props, context) {
    let send = props.send || context.send

    console.assert(
      send,
      `${
        Sender.displayName
      } was not given \`send\` via context or props. Was this component mounted within a Presenter?`
    )

    return createElement(Component, merge({ send }, props))
  }

  Sender.displayName = `withSend(${displayName(Component)})`
  Sender.contextTypes = CONTEXT_TYPES
  Sender.WrappedComponent = Component

  return Sender
}
