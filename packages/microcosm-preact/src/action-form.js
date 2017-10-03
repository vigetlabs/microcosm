import { h, Component } from 'preact'
import { Action, merge } from 'microcosm'
import serialize from 'form-serialize'

class ActionForm extends Component {
  constructor(props, context) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this._onSubmit = this._onSubmit.bind(this)

    this._assignForm = el => {
      this._form = el
    }
  }

  render() {
    let props = merge(this.props, {
      ref: this._assignForm,
      onSubmit: this._onSubmit
    })

    // Remove invalid props to prevent React warnings
    delete props.action
    delete props.prepare
    delete props.serializer
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send

    return h('form', props)
  }

  submit(event) {
    const { onSubmit, prepare, serializer, action } = this.props

    let form = this._form

    console.assert(
      form,
      'ActionForm has no form reference and can not submit. This can happen',
      'if submit() is called after the parent component has unmounted.'
    )

    if (action) {
      let result = this.send(action, prepare(serializer(form)))

      if (result instanceof Action) {
        result.subscribe(
          {
            onNext: this._onNext,
            onOpen: this._onOpen,
            onUpdate: this._onUpdate,
            onDone: this._onDone,
            onError: this._onError,
            onCancel: this._onCancel
          },
          this
        )
      }
    }

    onSubmit(event, action)
  }

  /* Private ------------------------------------------------------ */

  _onSubmit(event) {
    event.preventDefault()
    this.submit(event)
  }

  _onNext(action) {
    this.props.onNext(action, this._form)
  }

  _onOpen(payload) {
    this.props.onOpen(payload, this._form)
  }

  _onUpdate(payload) {
    this.props.onUpdate(payload, this._form)
  }

  _onError(payload) {
    this.props.onError(payload, this._form)
  }

  _onDone(payload) {
    this.props.onDone(payload, this._form)
  }

  _onCancel(payload) {
    this.props.onCancel(payload, this._form)
  }
}

const identity = n => n

ActionForm.defaultProps = {
  onCancel: identity,
  onDone: identity,
  onError: identity,
  onNext: identity,
  onOpen: identity,
  onSubmit: identity,
  onUpdate: identity,
  prepare: identity,
  serializer: form => serialize(form, { hash: true, empty: true })
}

export default ActionForm
