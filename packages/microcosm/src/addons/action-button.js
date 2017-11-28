/**
 * @flow
 */

import React from 'react'
import Observable from 'zen-observable'
import $observable from 'symbol-observable'
import { merge } from '../index'

const identity = n => n

type Props = {
  action: *,
  onCancel: ?Callback,
  onClick: (event?: Event, Action?: *) => *,
  onDone: ?Callback,
  onError: ?Callback,
  onNext: ?Callback,
  onStart: ?Callback,
  onComplete: ?Callback,
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
  _queue: *[]

  constructor(props: Props, context: Context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
    this._queue = []
  }

  componentWillUnmount() {
    this._queue.forEach(item => item.unsubscribe())
  }

  render() {
    const props = merge(this.props, { onClick: this.click })

    delete props.tag
    delete props.action
    delete props.value
    delete props.onStart
    delete props.onNext
    delete props.onComplete
    delete props.onError
    delete props.onNext
    delete props.send
    delete props.prepare

    if (this.props.tag === 'button' && props.type == null) {
      props.type = 'button'
    }

    return React.createElement(this.props.tag, props)
  }

  click(event: Event) {
    const { action, onClick, prepare, value } = this.props

    let params = prepare(value, event)
    let result = this.send(action, params)

    if (result && $observable in result) {
      this._queue.push(
        result.subscribe({
          start: this.props.onStart,
          next: this.props.onNext,
          complete: this.props.onComplete,
          error: this.props.onError
        })
      )
    }

    onClick(event, result)

    return result
  }
}

ActionButton.contextTypes = {
  send: () => {}
}

ActionButton.defaultProps = {
  action: null,
  onClick: identity,
  onStart: identity,
  onNext: identity,
  onComplete: identity,
  onError: identity,
  prepare: identity,
  send: null,
  tag: 'button',
  value: null
}

export default ActionButton
