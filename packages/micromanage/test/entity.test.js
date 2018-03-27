import { Entity } from 'micromanage'

it('must define a schema', () => {
  class NoSQL extends Entity {}

  expect(() => new NoSQL()).toThrow(/Entity "NoSQL" needs a schema./)
})

it('filters out keys outside of the schema', () => {
  class Planet extends Entity {
    static schema = {
      name: String
    }
  }

  let earth = new Planet({ name: 'Earth', color: 'blue' })

  expect(earth).toHaveProperty('name', 'Earth')
  expect(earth).not.toHaveProperty('color')
})

it('fails when a parameter does not match the schema', () => {
  class Planet extends Entity {
    static schema = {
      name: String
    }
  }

  expect(() => new Planet({ name: 2 })).toThrow(
    'Entity "Planet" expected a String for key "name". Instead found Number.'
  )
})

it('fails when a parameter is null', () => {
  class Planet extends Entity {
    static schema = {
      name: String
    }
  }

  expect(() => new Planet({ name: null })).toThrow(
    'Entity "Planet" expected a String for key "name". Instead found null.'
  )
})
