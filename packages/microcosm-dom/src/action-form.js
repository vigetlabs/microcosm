import serialize from 'form-serialize'
import { Subject, merge } from 'microcosm'
import { identity, noop, toCallbackName } from './utilities'

export function generateActionForm(createElement, Component) {
  class ActionForm extends Component {
    constructor() {
      super(...arguments)

      this.queue = new Subject('action-form')
      this._onSubmit = this._onSubmit.bind(this)
    }

    get send() {
      return this.props.send || this.context.send
    }

    componentWillUnmount() {
      this.queue.cancel()
    }

    render() {
      let props = merge(this.props, {
        onSubmit: this._onSubmit,
        ref: el => (this._form = el)
      })

      delete props.tag
      delete props.action
      delete props.prepare
      delete props.serializer
      delete props.onStart
      delete props.onNext
      delete props.onComplete
      delete props.onNext
      delete props.onCancel
      delete props.onError
      delete props.send

      return createElement(this.props.tag, props)
    }

    submit(event) {
      const { prepare, serializer, action } = this.props

      let params = prepare(serializer(this._form))
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

    _onSubmit(event) {
      event.preventDefault()
      this.props.onSubmit(event, this.submit())
    }
  }

  ActionForm.contextTypes = {
    send: noop
  }

  ActionForm.defaultProps = {
    action: 'no-action',
    onSubmit: identity,
    onStart: identity,
    onNext: identity,
    onComplete: identity,
    onError: identity,
    onCancel: identity,
    prepare: identity,
    send: null,
    tag: 'form',
    serializer: form => serialize(form, { hash: true, empty: true })
  }

  return ActionForm
}
