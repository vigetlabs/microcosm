import { get, update } from 'microcosm'
import { getName, getType, values } from './utilities'

function isSingular(def) {
  return def.directives.some(d => getName(d) == 'singular')
}

class Schema {
  constructor(document) {
    this._shapes = {}
    this._structure = {}

    // Scan the type information for the document before assigning fields.
    // This makes it easier to build relationships
    for (var i = 0; i < document.definitions.length; i++) {
      this.scan(document.definitions[i])
    }
  }

  scan(def) {
    let singular = isSingular(def)
    let key = getName(def)

    this._shapes[key] = singular ? 'single' : 'list'

    this._structure[key] = def.fields.reduce((memo, field) => {
      let list = field.type.kind === 'ListType'
      let name = getName(field)
      let type = getType(field.type)

      memo[name] = { name, type, list }

      return memo
    }, {})
  }

  mutations() {
    let mutations = this._structure.Mutation
    let fields = mutations ? values(mutations) : []

    return fields.reduce((memo, next) => {
      let [operation, resource] = next.name.split(/([A-Z].+$)/, 2)

      return update(
        memo,
        resource,
        list => list.concat({ ...next, operation, resource }),
        []
      )
    }, {})
  }

  types() {
    return Object.keys(this._structure)
  }

  shape(type) {
    return get(this._shapes, type)
  }

  structure(type) {
    return get(this._structure, type, null)
  }
}

export default Schema
