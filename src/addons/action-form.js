import { createElement, PropTypes, PureComponent } from 'react'
import { Action, merge, inherit } from '../microcosm'
import serialize from 'form-serialize'

function ActionForm () {
  PureComponent.apply(this, arguments)

  this.send = this.props.send || this.context.send
  this.onSubmit = this.onSubmit.bind(this)
}

ActionForm.contextTypes = {
  send : PropTypes.func
}

ActionForm.defaultProps = {
  action     : null,
  serializer : form => serialize(form, { hash: true, empty: true }),
  prepare    : n => n,
  onSubmit   : n => n
}

inherit(ActionForm, PureComponent, {

  render () {
    let props = merge({}, this.props, { ref: 'form', onSubmit: this.onSubmit })

    // Remove invalid props to prevent React warnings
    delete props.action
    delete props.prepare
    delete props.serializer
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    return createElement('form', )
  },

  onSubmit (event) {
    console.log('send')
    event.preventDefault()
    this.submit(event)
  },

  submit (event) {
    let form   = this.refs.form
    let params = this.props.prepare(this.props.serializer(form))
    let action = this.send(this.props.action, params)

    if (action && action instanceof Action) {
      action.onDone(this.props.onDone)
            .onUpdate(this.props.onUpdate)
            .onCancel(this.props.onCancel)
            .onError(this.props.onError)
    }

    this.props.onSubmit(event, action)
  }

})

export default ActionForm
