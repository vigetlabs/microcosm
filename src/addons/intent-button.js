import { Action, merge, inherit } from '../microcosm'
import { createElement, Component, PropTypes } from 'react'

export default function IntentButton (props, context) {
  Component.apply(this, arguments)

  this.send = this.props.send || this.context.send
  this.click = this.click.bind(this)
}

IntentButton.contextTypes = IntentButton.propTypes = {
  send: PropTypes.func
}

IntentButton.defaultProps = {
  tag: 'button'
}

inherit(IntentButton, Component, {

  click (event) {
    let action = this.send(this.props.intent, this.props.params)

    if (action && action instanceof Action) {
      action.onDone(this.props.onDone)
            .onUpdate(this.props.onUpdate)
            .onCancel(this.props.onCancel)
            .onError(this.props.onError)
    }

    if (this.props.onClick) {
      this.props.onClick(event, action)
    }

    return action
  },

  render () {
    const props = merge({}, this.props, { onClick: this.click })

    delete props.tag
    delete props.intent
    delete props.params
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    return createElement(this.props.tag, props)
  }

})
