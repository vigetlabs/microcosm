import { Subject, merge } from 'microcosm'
import { identity, noop } from './utilities'

export function generateActionButton(createElement, Component) {
  class ActionButton extends Component {
    constructor() {
      super(...arguments)

      this.queue = new Subject('action-button')
      this.click = this.click.bind(this)
    }

    get send() {
      return this.props.send || this.context.send
    }

    componentWillUnmount() {
      this.queue.cancel()
    }

    render() {
      let props = merge(this.props, { onClick: this.click })

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

    onChange(status, result) {
      switch (status) {
        case 'start':
          this.props.onStart(result.payload, result.meta)
          break
        case 'next':
          this.props.onNext(result.payload, result.meta)
          break
        case 'complete':
          this.props.onComplete(result.payload, result.meta)
          break
        case 'error':
          this.props.onError(result.payload, result.meta)
          break
        case 'cancel':
          this.props.onCancel(result.payload, result.meta)
          break
        default:
      }
    }

    click(event) {
      let { action, onClick, prepare, value } = this.props

      let params = prepare(value)
      let result = this.send(action, params)

      if (result && 'subscribe' in result) {
        result.subscribe({
          start: this.onChange.bind(this, 'start', result),
          error: this.onChange.bind(this, 'error', result),
          next: this.onChange.bind(this, 'next', result),
          complete: this.onChange.bind(this, 'complete', result),
          cancel: this.onChange.bind(this, 'cancel', result)
        })

        this.queue.subscribe(result)
      }

      if (event) {
        onClick(event, result)
      }

      return result
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
