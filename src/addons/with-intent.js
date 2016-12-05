/**
 * Connect a component to the presenter tree
 */

import React from 'react'
import merge from '../merge'
import displayName from '../display-name'

const danger = function (intent, params) {
  console.error('Unable to broadcast "%s" with parameters `%s`. withIntent did not receive context.',
                intent, JSON.stringify(params))
}

export default function withIntent (Component, intent) {

  function WithIntent (props, context) {
    let send = danger

    if (context) {
      send = props.send || context.send
    } else {
      console.error('withIntent(%s) did not receive context, was it called as a function instead of with React.createElement?',
                    displayName(Component))
    }

    return React.createElement(Component, merge({ send }, props))
  }

  WithIntent.contextTypes = WithIntent.propTypes = {
    send: React.PropTypes.func
  }

  return WithIntent
}
