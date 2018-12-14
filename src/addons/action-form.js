/**
 * @flow
 */

import assert from 'assert'
import React from 'react'
import DOM from 'react-dom'
import { Action, merge } from '../microcosm'
import serialize from 'form-serialize'

/* istanbul ignore next */
const identity = n => n
/* istanbul ignore next */
const noop = () => {}

type Props = {
  action: *,
  onOpen: ?Callback,
  onUpdate: ?Callback,
  onError: ?Callback,
  onCancel: ?Callback,
  onDone: ?Callback,
  onSubmit: (event: Event, Action: *) => *,
  confirm: (value?: *, event?: Event) => boolean,
  prepare: (value?: *, event?: Event) => *,
  send: ?Sender,
  serializer: (form: Element) => Object
}

type Context = {
  send: ?Sender
}

class ActionForm extends React.PureComponent<Props> {
  static defaultProps: Props
  static contextTypes: Context

  send: Sender
  form: Element
  onSubmit: *
  assignForm: Element => void

  constructor(props: Props, context: Context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    this.form = DOM.findDOMNode(this)
  }

  componentWillUnmount() {
    this.form = null
  }

  render() {
    let props = merge(this.props, {
      onSubmit: this.onSubmit
    })

    // Remove invalid props to prevent React warnings
    delete props.action
    delete props.prepare
    delete props.confirm
    delete props.serializer
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    return React.createElement('form', props)
  }

  onSubmit(event: Event) {
    event.preventDefault()
    this.submit(event)
  }

  submit(event: Event) {
    let form = this.form

    assert(
      form,
      'ActionForm has no form reference and can not submit. This can happen',
      'if submit() is called after the parent component has unmounted.'
    )

    let params = this.props.prepare(this.props.serializer(form))
    let action = null

    if (!this.props.confirm(params, event)) {
      return
    }

    if (this.props.action) {
      action = this.send(this.props.action, params)

      if (action && action instanceof Action) {
        action
          .onOpen(this.props.onOpen)
          .onUpdate(this.props.onUpdate)
          .onCancel(this.props.onCancel)
          .onDone(this.props.onDone)
          .onError(this.props.onError)
      }
    }

    this.props.onSubmit(event, action)
  }
}

ActionForm.contextTypes = {
  send: noop
}

ActionForm.defaultProps = {
  action: null,
  onOpen: null,
  onUpdate: null,
  onCancel: null,
  onError: null,
  onDone: null,
  onSubmit: noop,
  prepare: identity,
  confirm: (value, event) => true,
  send: null,
  serializer: form => serialize(form, { hash: true, empty: true })
}

export default ActionForm
