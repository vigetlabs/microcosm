import { LocalFactory } from './factories/local'
import { Domain, set, get, remove } from 'microcosm'
import { Cache } from './cache'
import { Entity } from './entity'
import { filter, find } from './utilities'

export function Collection(schema, Factory = LocalFactory) {
  let Record = typeof schema === 'object' ? Entity(schema) : schema
  let Empty = new Record({}, Infinity)
  let factory = new Factory(Record)

  return class EntityCollection extends Domain {
    static create = factory.create.bind(factory)
    static index = factory.index.bind(factory)
    static show = factory.show.bind(factory)
    static update = factory.update.bind(factory)
    static destroy = factory.destroy.bind(factory)

    constructor() {
      super(...arguments)
      this.cache = new Cache()
    }

    getInitialState() {
      return {}
    }

    identify(entity) {
      return entity._id
    }

    insert(state, params) {
      let entity = new Record(params)

      return set(state, entity._identifier, entity)
    }

    insertAll(state, records) {
      return [].concat(records).reduce(this.insert.bind(this), state)
    }

    update(state, params) {
      let entity = this.get(params.id)

      return set(state, entity._identifier, entity.update(params))
    }

    remove(state, id) {
      return remove(state, id)
    }

    register() {
      return {
        [EntityCollection.index]: this.insertAll,
        [EntityCollection.show]: this.insert,
        [EntityCollection.create]: this.insert,
        [EntityCollection.update]: this.update,
        [EntityCollection.destroy]: this.remove
      }
    }

    get(id) {
      return get(this.payload, id, Empty)
    }

    realize(payload) {
      return this.map(state => {
        if (Array.isArray(payload)) {
          return payload
            .map(item => get(state, item.id, Empty))
            .filter(i => i !== Empty)
        }

        return get(state, payload.id, Empty)
      })
    }

    cacheable(entry) {
      return entry.age < 30 * 1000
    }

    fetch(action, params) {
      let existing = this.cache.get(action, params)

      if (this.cacheable(existing)) {
        return existing.valueOf()
      }

      let job = this.repo.push(action, params).flatMap(this.realize, this)

      this.cache.set(action, params, job)

      return job
    }

    asArray() {
      return this.map(Object.values)
    }

    find(matcher) {
      return this.asArray().map(values => find(values, matcher))
    }

    filter(matcher) {
      return this.asArray().map(values => filter(values, matcher))
    }
  }
}
