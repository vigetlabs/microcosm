/**
 * Connect a component to the presenter tree
 */

import { createElement, PropTypes } from 'react'
import { merge } from '../microcosm'

export function displayName (Component) {
  return Component.displayName || Component.name || 'Component'
}

const TYPES = {
  send: PropTypes.func
}

export default function withSend (Component) {

  function withSend (props, context) {
    let send = props.send || context.send

    return createElement(Component, merge({ send }, props))
  }

  withSend.displayName = 'withSend(' + displayName(Component) + ')'
  withSend.contextTypes = withSend.propTypes = TYPES

  return withSend
}
