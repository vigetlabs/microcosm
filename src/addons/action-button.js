/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../microcosm'

class ActionButton extends React.PureComponent {
  send: Function
  click: (event: Event) => Action

  constructor(props: Object, context: ?Object) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
  }

  static contextTypes = {
    send: () => {}
  }

  static defaultProps = {
    tag: 'button'
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
    const props = merge({}, this.props, { onClick: this.click })

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

export default ActionButton
