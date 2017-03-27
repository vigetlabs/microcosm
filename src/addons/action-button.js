import { Task, merge } from '../microcosm'
import { createElement, PureComponent, PropTypes } from 'react'

export default class ActionButton extends PureComponent {

  constructor (props, context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
  }

  click (event) {
    let task = this.send(this.props.action, this.props.value)

    if (task instanceof Task) {
      task.onOpen(this.props.onOpen)
      task.onUpdate(this.props.onUpdate)
      task.onCancel(this.props.onCancel)
      task.onDone(this.props.onDone)
      task.onError(this.props.onError)
    }

    if (this.props.onClick) {
      this.props.onClick(event, task)
    }

    return task
  }

  render () {
    const props = merge({}, this.props, { onClick: this.click })

    delete props.tag
    delete props.action
    delete props.value
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    if (this.props.tag === 'button' && props.type == null) {
      props.type = 'button'
    }

    return createElement(this.props.tag, props)
  }

}

ActionButton.contextTypes = ActionButton.propTypes = {
  send: PropTypes.func
}

ActionButton.defaultProps = {
  tag: 'button'
}
