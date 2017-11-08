/**
 * @flow
 */

import React from 'react'
import DOM from 'react-dom'
import serialize from 'form-serialize'
import { Action, merge } from '../index'
import ActionQueue from './action-queue'

type Props = {
  action?: string | Command,
  onCancel: ActionFormCallback,
  onDone: ActionFormCallback,
  onError: ActionFormCallback,
  onNext: ActionFormCallback,
  onOpen: ActionFormCallback,
  onSubmit: ActionFormSubmit,
  onUpdate: ActionFormCallback,
  prepare: ActionFormPreparer,
  send?: Sender,
  serializer: ActionFormSerializer
}

type Context = {
  send: ?Sender
}

class ActionForm extends React.PureComponent<Props> {
  static defaultProps: Props
  static contextTypes: Context

  send: Sender

  _form: *
  _queue: ActionQueue
  _onSubmit: *

  constructor(props: Props, context: Context) {
    super(props, context)

    this.send = this.props.send || this.context.send

    this._onSubmit = this._onSubmit.bind(this)
    this._queue = new ActionQueue(this)
  }

  componentDidMount() {
    this._form = DOM.findDOMNode(this)
  }

  componentWillUnmount() {
    this._queue.empty()
    this._form = null
  }

  render() {
    let props = merge(this.props, {
      onSubmit: this._onSubmit
    })

    delete props.action
    delete props.prepare
    delete props.serializer
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.onNext
    delete props.send

    return React.createElement('form', props)
  }

  submit(event: Event) {
    const { onSubmit, prepare, serializer, action } = this.props

    let form = this._form

    console.assert(
      form,
      'ActionForm has no form reference and can not submit. This can happen',
      'if submit() is called after the parent component has unmounted.'
    )

    let params = prepare(serializer(form))
    let result = null

    if (action) {
      result = this.send(action, params)

      if (result && result instanceof Action) {
        this._queue.push(result, {
          onNext: this._onNext,
          onOpen: this._onOpen,
          onUpdate: this._onUpdate,
          onDone: this._onDone,
          onError: this._onError,
          onCancel: this._onCancel
        })
      }
    }

    onSubmit(event, action)
  }

  /* Private ------------------------------------------------------ */

  _onSubmit(event: Event) {
    event.preventDefault()
    this.submit(event)
  }

  _onNext(action: *) {
    this.props.onNext(action, this._form)
  }

  _onOpen(payload: *) {
    this.props.onOpen(payload, this._form)
  }

  _onUpdate(payload: *) {
    this.props.onUpdate(payload, this._form)
  }

  _onError(payload: *) {
    this.props.onError(payload, this._form)
  }

  _onDone(payload: *) {
    this.props.onDone(payload, this._form)
  }

  _onCancel(payload: *) {
    this.props.onCancel(payload, this._form)
  }
}

const identity = (n: any) => n

ActionForm.contextTypes = {
  send: () => null
}

ActionForm.defaultProps = {
  onOpen: identity,
  onUpdate: identity,
  onCancel: identity,
  onError: identity,
  onDone: identity,
  onNext: identity,
  onSubmit: identity,
  prepare: identity,
  serializer: form => serialize(form, { hash: true, empty: true })
}

export default ActionForm
