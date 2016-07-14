import React, { PropTypes } from 'react'
import Action from '../action'
import serialize from 'form-serialize'

const Form = React.createClass({

  contextTypes: {
    send : PropTypes.func.isRequired
  },

  propTypes: {
    intent     : PropTypes.string.isRequired,
    serializer : PropTypes.func,
    onSubmit   : PropTypes.func,
    onSuccess  : PropTypes.func,
    onFailure  : PropTypes.func
  },

  getDefaultProps() {
    return {
      intent     : null,
      serializer : form => serialize(form, { hash: true, empty: true }),
      onSubmit   : () => {},
      onSuccess  : () => {},
      onProgress : () => {},
      onFailure  : () => {}
    }
  },

  render() {
    const props = { ...this.props, onSubmit: this.onSubmit }

    // Remove invalid props to prevent React warnings
    delete props.intent
    delete props.serializer
    delete props.onSuccess
    delete props.onProgress
    delete props.onFailure

    return React.createElement('form', props)
  },

  onSubmit(event) {
    event.preventDefault()

    const form   = event.target
    const params = this.props.serializer(form)
    const action = this.context.send(this.props.intent, params)

    if (action && action instanceof Action) {
      action.onDone(payload => this.props.onSuccess(payload, form))
            .onUpdate(payload => this.props.onProgress(payload, form))
            .onError(error  => this.props.onFailure(error, form))
    }

    this.props.onSubmit(event, action)
  }

})

export default Form
