import assert from 'assert'
import { LocalFactory } from './factories/local'
import { Domain, set } from 'microcosm'

export function Collection(Entity, Factory = LocalFactory) {
  assert(
    Entity,
    `Expected an Entity constructor. Instead got ${String(Entity)}.`
  )

  let factory = new Factory(Entity)

  return class EntityCollection extends Domain {
    static create = factory.create
    static all = factory.all
    static find = factory.find
    static update = factory.update
    static destroy = factory.destroy

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
      let entity = state[params.id]

      if (entity) {
        return set(state, entity._identifier, entity.update(params))
      }

      return this.insert(state, params)
    }

    remove(state, id) {
      return set(state, id, undefined)
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
  }
}
