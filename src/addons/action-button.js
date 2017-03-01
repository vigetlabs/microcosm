import { Action, merge, inherit } from '../microcosm'
import { createElement, PureComponent, PropTypes } from 'react'

export default function ActionButton (props, context) {
  PureComponent.apply(this, arguments)

  this.send = this.props.send || this.context.send
  this.click = this.click.bind(this)
}

ActionButton.contextTypes = ActionButton.propTypes = {
  send: PropTypes.func
}

ActionButton.defaultProps = {
  tag: 'button'
}

inherit(ActionButton, PureComponent, {

  click (event) {
    let action = this.send(this.props.action, this.props.value)

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
    delete props.action
    delete props.value
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    return createElement(this.props.tag, props)
  }

})
