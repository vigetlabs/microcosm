/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../microcosm'
import serialize from 'form-serialize'

/* istanbul ignore next */
const identity = () => {}

class ActionForm extends React.PureComponent {
  static defaultProps;

  send: Sender
  onSubmit: (event: Event) => Action

  constructor(props: Object, context: Object) {
    super(props)

    this.send = this.props.send || this.context.send
    this.onSubmit = this.onSubmit.bind(this)
  }

  render() {
    let props = merge(this.props, { ref: 'form', onSubmit: this.onSubmit })

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
    let form = this.refs.form
    let params = this.props.prepare(this.props.serializer(form))
    let action = this.send(this.props.action, params)

    if (action && action instanceof Action) {
      action
        .onOpen(this.props.onOpen)
        .onUpdate(this.props.onUpdate)
        .onCancel(this.props.onCancel)
        .onDone(this.props.onDone)
        .onError(this.props.onError)
    }

    this.props.onSubmit(event, action)
  }
}

ActionForm.contextTypes = {
  send: identity
}

ActionForm.defaultProps = {
  action: null,
  serializer: form => serialize(form, { hash: true, empty: true }),
  prepare: n => n,
  onSubmit: n => n
}

export default ActionForm
