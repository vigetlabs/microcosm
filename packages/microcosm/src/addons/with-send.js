/**
 * Connect a component to the presenter tree
 * @flow
 */

import { createElement } from 'react'
import { merge } from '../index'

function displayName(Component: Object) {
  return Component.displayName || Component.name || 'Component'
}

const CONTEXT_TYPES = {
  send: () => {}
}

export default function withSend(Component: *): * {
  function Sender(props: Object, context: Object) {
    let send = props.send || context.send

    console.assert(
      this.send,
      `${Sender.displayName} was not given \`send\` via context or props. Was this component mounted within a Presenter?`
    )

    return createElement(Component, merge({ send }, props))
  }

  withSend.displayName = 'withSend(' + displayName(Component) + ')'

  withSend.contextTypes = CONTEXT_TYPES

  withSend.WrappedComponent = Component

  return withSend
}
