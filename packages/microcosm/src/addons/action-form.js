/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../index'
import serialize from 'form-serialize'

const identity = n => n

type Props = {
  action: *,
  onOpen: ?Callback,
  onUpdate: ?Callback,
  onError: ?Callback,
  onCancel: ?Callback,
  onDone: ?Callback,
  onSubmit: (event: Event, Action: *) => *,
  prepare: (data: Object) => Object,
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
    this.assignForm = el => {
      this.form = el
    }
  }

  render() {
    let props = merge(this.props, {
      ref: this.assignForm,
      onSubmit: this.onSubmit
    })

    // Remove invalid props to prevent React warnings
    delete props.action
    delete props.prepare
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
    const { onSubmit, prepare, serializer, action } = this.props

    let form = this.form

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
        result.subscribe(this.props)
      }
    }

    onSubmit(event, action)
  }
}

ActionForm.contextTypes = {
  send: () => {}
}

ActionForm.defaultProps = {
  action: null,
  onOpen: null,
  onUpdate: null,
  onCancel: null,
  onError: null,
  onDone: null,
  onSubmit: identity,
  prepare: identity,
  send: null,
  serializer: form => serialize(form, { hash: true, empty: true })
}

export default ActionForm
