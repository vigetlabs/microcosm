import serialize from 'form-serialize'
import { h, Component } from 'preact'
import { Subject, merge } from 'microcosm'
import { identity } from './utilities'

export class ActionForm extends Component {
  constructor() {
    super(...arguments)

    this.queue = new Subject('action-form')
    this.submit = this.submit.bind(this)
  }

  get send() {
    return this.props.send || this.context.send
  }

  componentWillUnmount() {
    this.queue.unsubscribe()
  }

  render() {
    let props = merge(this.props, {
      onSubmit: this.submit,
      ref: el => (this.form = el)
    })

    delete props.tag
    delete props.action
    delete props.prepare
    delete props.serializer
    delete props.onStart
    delete props.onNext
    delete props.onComplete
    delete props.onNext
    delete props.onUnsubscribe
    delete props.onError
    delete props.send

    return h(this.props.tag, props)
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

  submit(event) {
    const { onSubmit, prepare, serializer, action } = this.props

    let params = prepare(serializer(this.form))
    let result = this.send(action, params)

    if (result && 'subscribe' in result) {
      result.subscribe({
        start: this.onChange.bind(this, 'start', result),
        error: this.onChange.bind(this, 'error', result),
        next: this.onChange.bind(this, 'next', result),
        complete: this.onChange.bind(this, 'complete', result),
        unsubscribe: this.onChange.bind(this, 'unsubscribe', result)
      })

      this.queue.subscribe(result)
    }

    if (event) {
      onSubmit(event, result)
    }

    return result
  }
}

ActionForm.defaultProps = {
  action: 'no-action',
  onSubmit: identity,
  onStart: identity,
  onNext: identity,
  onComplete: identity,
  onError: identity,
  onUnsubscribe: identity,
  prepare: identity,
  send: null,
  tag: 'form',
  serializer: form => serialize(form, { hash: true, empty: true })
}
