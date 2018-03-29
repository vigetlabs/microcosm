import { Entity, Collection } from 'micromanage'
import { values } from 'lodash'

export class Planet extends Entity {
  static schema = {
    title: 'Planet',
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', title: 'Name' },
      weight: { type: 'number', title: 'Weight', default: 100, min: 0 },
      belt: { type: 'string', enum: ['inner', 'outer'], default: 'inner' }
    }
  }
}

export class Planets extends Collection(Planet) {
  all(matcher) {
    return this.map(values)
  }
}
