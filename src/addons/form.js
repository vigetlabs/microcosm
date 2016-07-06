import React, { PropTypes } from 'react'
import Action from '../action'
import serialize from 'form-serialize'

const Form = React.createClass({

  contextTypes: {
    send : PropTypes.func.isRequired
  },

  propTypes: {
    intent    : PropTypes.string.isRequired,
    onSubmit  : PropTypes.func,
    onSuccess : PropTypes.func,
    onFailure : PropTypes.func
  },

  getDefaultProps() {
    return {
      serializer : form => serialize(form, { hash: true, empty: true }),
      onSubmit   : () => {},
      onSuccess  : () => {},
      onFailure  : () => {}
    }
  },

  render() {
    const { intent, onSubmit, onSuccess, onFailure, serializer, ...props } = this.props

    return <form { ...props } onSubmit={ this.onSubmit } ref="form" />
  },

  onSubmit(event) {
    event.preventDefault()

    const form   = this.refs.form
    const params = this.props.serializer(form)
    const action = this.context.send(this.props.intent, params)

    if (action instanceof Action) {
      action.onDone(payload => this.props.onSuccess(payload, form))
            .onError(error  => this.props.onFailure(error, form))
    }

    this.props.onSubmit(event, action)
  }

})

export default Form
