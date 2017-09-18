/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../index'

const identity = n => n

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
    const { action, onClick, prepare, value } = this.props

    let params = prepare(value, event)
    let result = null

    if (action) {
      result = this.send(action, params)

      if (result && result instanceof Action) {
        result.subscribe(this.props)
      }
    }

    onClick(event, action)
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
  send: () => {}
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
