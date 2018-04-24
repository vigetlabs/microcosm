import { Subject, merge } from 'microcosm'
import { identity, noop, toCallbackName } from './utilities'

export function generateActionButton(createElement, Component) {
  class ActionButton extends Component {
    constructor() {
      super(...arguments)

      this.queue = this.props.queue || new Subject()
      this._onClick = this._onClick.bind(this)
    }

    get send() {
      return this.props.send || this.context.send
    }

    componentWillUnmount() {
      this.queue.complete()
    }

    render() {
      let props = merge(this.props, { onClick: this._onClick })

      delete props.tag
      delete props.action
      delete props.value
      delete props.onSend
      delete props.onNext
      delete props.onComplete
      delete props.onChange
      delete props.onError
      delete props.onCancel
      delete props.send
      delete props.prepare

      return createElement(this.props.tag, props)
    }

    click() {
      let result = this.send(this.props.action, this._parameterize())
      let action = Subject.hash(result)

      this.props.onSend(action)

      let tracker = action.every(this._onChange, this)

      this.queue.subscribe({
        error: tracker.unsubscribe,
        complete: tracker.unsubscribe,
        cancel: action.cancel
      })

      return action
    }

    // Private --------------------------------------------------- //

    _parameterize() {
      let { value, prepare } = this.props

      return prepare(value)
    }

    _onChange(action) {
      this.props[toCallbackName(action.status)](action)
    }

    _onClick(event) {
      event.preventDefault()
      this.props.onClick(event, this.click())
    }
  }

  ActionButton.contextTypes = {
    send: noop
  }

  ActionButton.defaultProps = {
    action: 'no-action',
    onClick: identity,
    onSend: identity,
    onNext: identity,
    onComplete: identity,
    onError: identity,
    onChange: identity,
    onCancel: identity,
    prepare: identity,
    queue: null,
    send: null,
    tag: 'button',
    value: null
  }

  return ActionButton
}
