import sprout from 'sprout-data'

function put (state, path, value) {
  return sprout.assoc(state, path, value)
}

function patch (state, path, value) {
  let record = sprout.get(state, path)
  let patched = sprout.merge(record || {}, value)

  return sprout.assoc(state, path, patched)
}

function destroy (state, path, value) {
  let items = [].concat(path)

  return sprout.dissoc(state, ...items)
}

function transpose (state, key, records) {
  return [].concat(records).reduce((memo, item) => {
    return put(memo, [sprout.get(item, key)], item)
  }, state)
}

function operate (state, rule) {
  let operation = rule[0]

  if (Array.isArray(operation)) {
    return rule.reduce(operate, state)
  }

  let value = rule[rule.length - 1]
  let path = rule.length > 2 ? rule.slice(1, -1) : rule[1]

  switch (operation) {
    case 'put':
      return put(state, path, value)
    case 'patch':
      return patch(state, path, value)
    case 'reset':
      return value == null ? {} : value
    case 'transpose':
      return transpose(state, path, value)
    case 'destroy':
      return destroy(state, path)
  }

  return state
}

class Databank {

  getInitialState () {
    return ['reset', {}]
  }

  stage (state, rule) {
    return operate(state, rule)
  }

  shouldCommit (a, b) {
    return a !== b
  }

  comparator (a, b) {
    return 0
  }

  commit (state, all) {
    let ids = Object.keys(state)
    let items = ids.map(key => state[key])

    if (this.filter) {
      items = this.filter((item, i) => this.filter(item, i, all), this)
    }

    return items.sort(this.comparator)
  }

}

export default Databank
