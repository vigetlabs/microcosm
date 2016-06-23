import Emitter   from 'component-emitter'
import coroutine from './action/coroutine'
import tag       from './action/tag'
import States    from './action/states'

export default function Action (action) {
  this.action = tag(action)
}

Action.prototype = {
  depth   : 0,
  parent  : null,
  sibling : null,
  state   : States.UNSET,

  appendTo(parent) {
    this.parent = parent

    if (parent) {
      this.depth   = parent.depth + 1
      this.sibling = parent.next

      parent.next = this
    }

    return this
  },

  get type() {
    if (this.is(States.DISABLED))  return null
    if (this.is(States.CANCELLED)) return this.action.cancelled
    if (this.is(States.FAILED))    return this.action.failed
    if (this.is(States.DONE))      return this.action.done
    if (this.is(States.LOADING))   return this.action.loading
    if (this.is(States.OPEN))      return this.action.open

    return null
  },

  get children() {
    let start = this.next
    let nodes = []

    while (start) {
      nodes.push(start)
      start = start.sibling
    }

    return nodes
  },

  is (type) {
    if (typeof type === 'string') {
      type = States[type.toUpperCase()]
    }

    return (this.state & type) === type
  },

  execute(/** params **/) {
    return coroutine(this, this.action.apply(this, arguments))
  },

  set(payload) {
    if (payload != undefined) {
      this.payload = payload
    }

    this.emit('change')
  },

  open(payload) {
    this.state = States.OPEN
    this.set(payload)
    this.emit('open', this.payload)
  },

  send(payload) {
    this.state = States.LOADING
    this.set(payload)
    this.emit('update', this.payload)
  },

  reject(payload) {
    this.state = States.FAILED | States.DISPOSABLE
    this.set(payload)
    this.emit('error', payload)
  },

  close(payload) {
    this.state = States.DONE | States.DISPOSABLE
    this.set(payload)
    this.emit('done', this.payload)
  },

  cancel() {
    this.state = States.CANCELLED | States.DISPOSABLE
    this.emit('change')
    this.emit('cancel', this.payload)
  },

  toggle() {
    this.state ^= States.DISABLED
    this.emit('change')
  },

  onError(callback, scope) {
    if (this.is('failed')) {
      callback(this.payload, scope)
    } else {
      this.once('error', callback.bind(scope))
    }

    return this
  },

  onUpdate(callback, scope) {
    this.listen('update', callback.bind(scope))

    return this
  },

  onDone(callback, scope) {
    if (this.is('done')) {
      callback(this.payload, scope)
    } else {
      this.once('done', callback.bind(scope))
    }

    return this
  }
}

Emitter(Action.prototype)
