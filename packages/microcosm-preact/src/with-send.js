/**
 * Connect a component to the presenter tree
 */

import { h } from 'preact'
import { merge } from 'microcosm'

export function displayName(Component) {
  return Component.name || 'Component'
}

export default function withSend(Component) {
  function withSend(props, context) {
    let send = props.send || context.send

    return h(Component, merge({ send }, props))
  }

  withSend.displayName = 'withSend(' + displayName(Component) + ')'

  withSend.WrappedComponent = Component

  return withSend
}
