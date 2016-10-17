import React, { PropTypes } from 'react'
import Action from '../action'
import serialize from 'form-serialize'
import merge from '../merge'

const Form = React.createClass({

  contextTypes: {
    send : PropTypes.func.isRequired
  },

  propTypes: {
    intent     : PropTypes.oneOfType([ PropTypes.string, PropTypes.func]),
    serializer : PropTypes.func,
    onSubmit   : PropTypes.func,
    onDone     : PropTypes.func,
    onUpdate   : PropTypes.func,
    onError    : PropTypes.func,
    onCancel   : PropTypes.func
  },

  getDefaultProps() {
    return {
      intent     : null,
      serializer : form => serialize(form, { hash: true, empty: true }),
      onSubmit   : () => {}
    }
  },

  render() {
    const props = merge({}, this.props, { onSubmit: this.onSubmit })

    // Remove invalid props to prevent React warnings
    delete props.intent
    delete props.serializer
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError

    return React.createElement('form', props)
  },

  onSubmit(event) {
    event.preventDefault()

    const form   = event.target
    const params = this.props.serializer(form)
    const action = this.context.send(this.props.intent, params)

    if (action && action instanceof Action) {
      action.onDone(this.props.onDone)
            .onUpdate(this.props.onUpdate)
            .onCancel(this.props.onCancel)
            .onError(this.props.onError)
    }

    this.props.onSubmit(event, action)
  }

})

export default Form
