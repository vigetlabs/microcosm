/**
 * Connect a component to the presenter tree
 */

import { createElement, PropTypes } from 'react'
import { merge } from '../microcosm'

export function displayName (Component) {
  return Component.displayName || Component.name || 'Component'
}

function danger (action, params) {
  console.error('Unable to broadcast "%s" with parameters `%s`. withSend did not receive context.',
                action, JSON.stringify(params))
}

const TYPES = {
  send: PropTypes.func
}

export default function withSend (Component) {

  function withSend (props, context) {
    let send = danger

    if (context) {
      send = props.send || context.send
    } else {
      console.error('withSend(%s) did not receive context, was it called as a function instead of with React.createElement?',
                    displayName(Component))
    }

    return createElement(Component, merge({ send }, props))
  }

  withSend.displayName = 'withSend(' + displayName(Component) + ')'
  withSend.contextTypes = withSend.propTypes = TYPES

  return withSend
}
