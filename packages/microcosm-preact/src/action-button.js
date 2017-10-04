import { h, Component } from 'preact'
import { Action, merge } from 'microcosm'
import ActionQueue from 'microcosm/addons/action-queue'

class ActionButton extends Component {
  constructor(props, context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)

    this._queue = new ActionQueue(this)
  }

  componentWillUnmount() {
    this._queue.empty()
  }

  render() {
    const props = merge(this.props, { onClick: this.click })

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

    return h(this.props.tag, props)
  }

  click(event) {
    let action = this.send(this.props.action, this.props.value)

    if (action instanceof Action) {
      this._queue.push(action, this.props)
    }

    if (this.props.onClick) {
      this.props.onClick(event, action)
    }

    return action
  }
}

ActionButton.defaultProps = {
  tag: 'button'
}

export default ActionButton
