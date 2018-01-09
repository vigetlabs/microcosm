import { createElement, PureComponent } from 'react'
import { Observable, Subject, merge } from 'microcosm'
import { identity, noop } from './utilities'

export class ActionButton extends PureComponent {
  constructor() {
    super(...arguments)

    this.queue = new Subject('action-button')
    this.click = this.click.bind(this)
  }

  get send() {
    return this.props.send || this.context.send
  }

  componentWillUnmount() {
    this.queue.unsubscribe()
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
    delete props.onUnsubscribe
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
      case 'unsubscribe':
        this.props.onUnsubscribe(result.payload, result.meta)
        break
      default:
    }
  }

  click(event) {
    let { action, onClick, prepare, value } = this.props

    let params = prepare(value)
    let result = this.send(action, params)

    if (Observable.isObservable(result)) {
      let subscriber = result.subscribe({
        start: this.onChange.bind(this, 'start', result),
        error: this.onChange.bind(this, 'error', result),
        next: this.onChange.bind(this, 'next', result),
        complete: this.onChange.bind(this, 'complete', result),
        unsubscribe: this.onChange.bind(this, 'unsubscribe', result)
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
  action: null,
  onClick: identity,
  onStart: identity,
  onNext: identity,
  onComplete: identity,
  onError: identity,
  onUnsubscribe: identity,
  prepare: identity,
  send: null,
  tag: 'button',
  value: null
}
