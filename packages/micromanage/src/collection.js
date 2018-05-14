import { LocalFactory } from './factories/local'
import { Domain, set } from 'microcosm'

export function Collection(Entity, Factory = LocalFactory) {
  let factory = new Factory(Entity)

  return class EntityCollection extends Domain {
    static create = factory.create
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

      return set(state, this.identify(entity), entity)
    }

    update(state, params) {
      let entity = state[params.id]

      if (entity) {
        return set(state, this.identify(entity), entity.update(params))
      }

      return this.insert(state, params)
    }

    remove(state, id) {
      return set(state, id, undefined)
    }

    register() {
      return {
        [EntityCollection.create]: this.insert,
        [EntityCollection.update]: this.update,
        [EntityCollection.destroy]: this.remove
      }
    }
  }
}
