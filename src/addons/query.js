import { get } from '../microcosm'
import shallow from 'shallow-equals'

const EMPTY_ARRAY = []

function startsWith (a, b) {
  let right = b.length

  if (a.length < right) {
    return false
  }

  while (--right >= 0) {
    if (b[right] !== a[right]) {
      return false
    }
  }

  return true
}

function getKeyPath (key) {
  return Array.isArray(key) ? key : key.split('.')
}

function _join (focus, field, keyPath) {
  let other = get(this.state, keyPath)

  return focus.filter(item => get(item, field) === other)
}

function _filter (focus, fn) {
  return focus.filter(fn)
}

function _map (focus, fn) {
  return focus.map(fn)
}

function _is (focus, value) {
  return focus === value
}

function _at (list, index) {
  let size  = list.length
  let place = index < 0 ? size + index : index

  if (place >= size || place < 0) {
    return undefined
  }

  return list[place]
}

function consolidate (path, dependencies) {
  let same = true

  for (var i = 0, len = dependencies.length; i < len; i++) {
    let sub = dependencies[i]

    if (startsWith(sub, path) || startsWith(path, sub)) {
      if (same) {
        dependencies[i] = sub.length > path.length ? path : sub
      } else {
        dependencies.splice(i, -1)
        len--
      }
      same = false
    }
  }

  if (same) {
    dependencies.push(path)
  }

  return dependencies
}

export default function Query (parent, transform, params, track) {
  this.root = !parent
  this.computed = false
  this.answer = undefined

  this.parent = parent
  this.tracking = track || EMPTY_ARRAY

  this.state = parent ? parent.state : undefined
  this.transform = transform
  this.params = params || EMPTY_ARRAY

  this.select = this.get.bind(this)
}

Query.prototype = {

  _spawn (fn, params, keyPath) {
    let deps = this.tracking.slice(0)

    if (keyPath) {
      consolidate(keyPath, deps)
    }

    return new Query(this, fn, params, deps)
  },

  get (keyPath, fallback) {
    let path = getKeyPath(keyPath)

    return this._spawn(get, [path, fallback], path)
  },

  map (fn) {
    return this._spawn(_map, [fn])
  },

  filter (fn) {
    return this._spawn(_filter, [fn])
  },

  join (field, keyPath) {
    let path = getKeyPath(keyPath)

    return this._spawn(_join, [field, path], path)
  },

  tap (fn, ...args) {
    return this._spawn(fn, args)
  },

  at (index) {}
    return this._spawn(_at, [index])
  },

  shouldChange (state) {
    if (!this.computed) {
      return true
    }

    for (var i = 0, len = this.tracking.length; i < len; i++) {
      var path = this.tracking[i]
      if (get(state, path) !== get(this.state, path)) {
        return true
      }
    }

    return false
  },

  compute (state) {
    if (this.root) {
      return this.state = this.answer = state
    }

    let didChange = this.shouldChange(state)

    this.state = state

    if (didChange) {
      let source = this.parent.compute(state)
      let output = this.transform(source, ...this.params)

      if (shallow(this.answer, output) === false) {
        this.computed = true
        this.answer = output
      }
    }

    return this.answer
  }

}
