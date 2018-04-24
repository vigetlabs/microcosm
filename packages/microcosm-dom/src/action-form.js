import serialize from 'form-serialize'
import { Subject, merge } from 'microcosm'
import { identity, noop, toCallbackName } from './utilities'

export function generateActionForm(createElement, Component) {
  class ActionForm extends Component {
    constructor() {
      super(...arguments)

      this.queue = this.props.queue || new Subject()
      this._onSubmit = this._onSubmit.bind(this)
    }

    get send() {
      return this.props.send || this.context.send
    }

    componentWillUnmount() {
      this.queue.complete()
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
      delete props.onSend
      delete props.onNext
      delete props.onComplete
      delete props.onNext
      delete props.onCancel
      delete props.onError
      delete props.send
      delete props.value

      return createElement(this.props.tag, props)
    }

    submit(event) {
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
      let { value, prepare, serializer } = this.props

      return value !== undefined
        ? prepare(value)
        : prepare(serializer(this._form))
    }

    _onChange(action) {
      this.props[toCallbackName(action.status)](action)
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
    onSend: identity,
    onNext: identity,
    onComplete: identity,
    onChange: identity,
    onError: identity,
    onCancel: identity,
    prepare: identity,
    queue: null,
    send: null,
    tag: 'form',
    serializer: form => serialize(form, { hash: true, empty: true })
  }

  return ActionForm
}
