import React, { PropTypes } from 'react'
import Action from '../action'
import serialize from 'form-serialize'

const Form = React.createClass({

  contextTypes: {
    send : PropTypes.func.isRequired
  },

  propTypes: {
    intent : React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      serializer : form => serialize(form, { hash: true }),
      onSubmit   : () => {},
      onSuccess  : () => {},
      onFailure  : () => {}
    }
  },

  render() {
    return (
      <form { ...this.props } onSubmit={ this.onSubmit } ref="form">
        { this.props.children }
      </form>
    )
  },

  onSubmit(event) {
    event.preventDefault()

    const form   = this.refs.form
    const params = this.props.serializer(form)
    const action = this.context.send(this.props.intent, params)

    this.props.onSubmit(event)

    if (action instanceof Action) {
      action.onDone(payload => this.props.onSuccess(payload, form))
            .onError(error  => this.props.onFailure(error, form))
    }
  }

})

export default Form
