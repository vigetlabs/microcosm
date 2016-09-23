/**
 * Connect a component to the presenter tree
 */

import React from 'react'
import merge from '../merge'

export default function withIntent (Component, intent) {

  function WithIntent (props, context = {}) {
    let send = props.send || context.send

    return React.createElement(Component, merge({ send }, props))
  }

  WithIntent.contextTypes = WithIntent.propTypes = {
    send: React.PropTypes.func
  }

  return WithIntent
}
