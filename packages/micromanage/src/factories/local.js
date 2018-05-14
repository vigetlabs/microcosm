/**
 * A "stand-alone" factory for generating entities with no API backing
 */

let uid = 0

export class LocalFactory {
  constructor(Entity) {
    this.schema = Entity.schema
  }

  index() {
    throw new Error('Not implemented')
  }

  show(id) {
    throw new Error('Not implemented')
  }

  create(params) {
    return { id: uid++, ...params }
  }

  update(params) {
    return params
  }

  destroy(id) {
    return id
  }
}
