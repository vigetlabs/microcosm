import assert from 'assert'
import { LocalFactory } from './factories/local'
import { Observable, Domain, set, get, remove } from 'microcosm'
import { Cache } from './cache'

export function Collection(Entity, Factory = LocalFactory) {
  assert(
    Entity,
    `Expected an Entity constructor. Instead got ${String(Entity)}.`
  )

  let factory = new Factory(Entity)
  let Empty = new Entity({}, Infinity)

  return class EntityCollection extends Domain {
    static create = factory.create
    static all = factory.all
    static find = factory.find
    static update = factory.update
    static destroy = factory.destroy

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
      let entity = new Entity(params)

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
        [EntityCollection.all]: this.insertAll,
        [EntityCollection.find]: this.insert,
        [EntityCollection.create]: this.insert,
        [EntityCollection.update]: this.update,
        [EntityCollection.destroy]: this.remove
      }
    }

    get(id) {
      return get(this.payload, id, Empty)
    }

    isExpired(id) {
      return this.get(id)._age > 30 * 1000
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

    fetch(action, params) {
      let existing = this.cache.get(action, params)

      if (existing.age < 30 * 1000) {
        return existing.valueOf()
      }

      let job = this.repo.push(action, params).flatMap(this.realize, this)

      this.cache.set(action, params, job)

      return job
    }
  }
}
