import { Entity } from 'micromanage'

it('fails when a property is missing a type', () => {
  class Planet extends Entity {
    static schema = {
      properties: {
        name: {}
      }
    }
  }

  expect(() => new Planet({ name: 2 })).toThrow(
    'Planet must define a type for property "name".'
  )
})

it('fails when it can not recognize a type and there is no default', () => {
  class Planet extends Entity {
    static schema = {
      properties: {
        name: { type: 'other' }
      }
    }
  }

  expect(() => new Planet()).toThrow(
    'Unable to determine default value for property "name". Please use a recognized type or provide a default value.'
  )
})

it('can set defaults', () => {
  class Planet extends Entity {
    static schema = {
      properties: {
        name: { type: 'string', default: 'planet' }
      }
    }
  }

  expect(new Planet()).toHaveProperty('name', 'planet')
})
