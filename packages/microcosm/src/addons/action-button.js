/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../index'

/* istanbul ignore next */
const identity = n => n
/* istanbul ignore next */
const noop = () => {}

type Props = {
  action: *,
  onCancel: ?Callback,
  onClick: (event?: Event, Action?: *) => *,
  onDone: ?Callback,
  onError: ?Callback,
  onOpen: ?Callback,
  onUpdate: ?Callback,
  prepare: (value?: *, event?: Event) => *,
  send: ?Sender,
  tag: string | React$ElementType,
  value: *
}

type Context = {
  send: ?Sender
}

class ActionButton extends React.PureComponent<Props> {
  static defaultProps: Props
  static contextTypes: Context

  send: Sender
  click: (event: Event) => Action

  constructor(props: Props, context: Context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
  }

  click(event: Event) {
    let payload = this.props.prepare(this.props.value, event)
    let action = null

    if (this.props.action) {
      action = this.send(this.props.action, payload)

      if (action && action instanceof Action) {
        action
          .onOpen(this.props.onOpen)
          .onUpdate(this.props.onUpdate)
          .onCancel(this.props.onCancel)
          .onDone(this.props.onDone)
          .onError(this.props.onError)
      }
    }

    if (this.props.onClick) {
      this.props.onClick(event, action)
    }
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
    delete props.prepare

    if (this.props.tag === 'button' && props.type == null) {
      props.type = 'button'
    }

    return React.createElement(this.props.tag, props)
  }
}

ActionButton.contextTypes = {
  send: noop
}

ActionButton.defaultProps = {
  action: null,
  onCancel: null,
  onClick: identity,
  onDone: null,
  onError: null,
  onOpen: null,
  onUpdate: null,
  prepare: identity,
  send: null,
  tag: 'button',
  value: null
}

export default ActionButton
