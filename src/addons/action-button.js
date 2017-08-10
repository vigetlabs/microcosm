/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../microcosm'

/* istanbul ignore next */
const identity = () => {}

class ActionButton extends React.PureComponent {
  static defaultProps;

  send: Sender
  click: (event: Event) => Action

  constructor(props: Object, context: Object) {
    super(props)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
  }

  click(event: Event): Action {
    let action = this.send(this.props.action, this.props.value)

    if (action && action instanceof Action) {
      action
        .onOpen(this.props.onOpen)
        .onUpdate(this.props.onUpdate)
        .onCancel(this.props.onCancel)
        .onDone(this.props.onDone)
        .onError(this.props.onError)
    }

    if (this.props.onClick) {
      this.props.onClick(event, action)
    }

    return action
  }

  render() {
    const props = merge(this.props, { onClick: this.click })

    delete props.tag
    delete props.action
    delete props.value
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    if (this.props.tag === 'button' && props.type == null) {
      props.type = 'button'
    }

    return React.createElement(this.props.tag, props)
  }
}

ActionButton.contextTypes = {
  send: identity
}

ActionButton.defaultProps = {
  tag: 'button'
}

export default ActionButton
