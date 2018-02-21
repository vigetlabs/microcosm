import { Subject, merge } from 'microcosm'
import { identity, noop, toCallbackName } from './utilities'

export function generateActionButton(createElement, Component) {
  class ActionButton extends Component {
    constructor() {
      super(...arguments)

      this.queue = new Subject('action-button')
      this._onClick = this._onClick.bind(this)
    }

    get send() {
      return this.props.send || this.context.send
    }

    componentWillUnmount() {
      this.queue.cancel()
    }

    render() {
      let props = merge(this.props, { onClick: this._onClick })

      delete props.tag
      delete props.action
      delete props.value
      delete props.onStart
      delete props.onNext
      delete props.onComplete
      delete props.onError
      delete props.onCancel
      delete props.send
      delete props.prepare

      if (this.props.tag === 'button' && props.type == null) {
        props.type = 'button'
      }

      return createElement(this.props.tag, props)
    }

    click() {
      let { action, prepare, value } = this.props

      let params = prepare(value)
      let result = this.send(action, params)

      if (result && 'subscribe' in result) {
        this._onChange('start', result)

        result.subscribe({
          error: this._onChange.bind(this, 'error', result),
          next: this._onChange.bind(this, 'next', result),
          complete: this._onChange.bind(this, 'complete', result),
          cancel: this._onChange.bind(this, 'cancel', result)
        })

        this.queue.subscribe(result)
      }

      return result
    }

    // Private --------------------------------------------------- //

    _onChange(status, result) {
      this.props[toCallbackName(status)](result.payload, result.meta)
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
    onStart: identity,
    onNext: identity,
    onComplete: identity,
    onError: identity,
    onCancel: identity,
    prepare: identity,
    send: null,
    tag: 'button',
    value: null
  }

  return ActionButton
}
