import gql from 'graphql-tag'
import Repo from '../../src/repo'
import { find, filter } from '../../src/utilities'

export const SOLAR_SCHEMA = gql`
  type Star {
    id: ID
    name: String
    planets: [Planet]
  }

  type Planet {
    id: ID
    name: String
    weight: Int
    star: Star
  }

  type Query {
    planet(id: ID, name: String): Planet
    planets(name: String, weight: Int): [Planet]
    star(id: ID, name: String): Star
    stars(name: String): [Star]
    paginatedPlanets(limit: Int, offset: Int): [Planet]
  }
`

export const SOLAR_DATA = {
  Planet: [
    { id: '0', name: 'Mercury', weight: 100, star: '0' },
    { id: '1', name: 'Venus', weight: 200, star: '0' },
    { id: '2', name: 'Earth', weight: 300, star: '0' }
  ],
  Star: [{ id: '0', name: 'Sol' }, { id: '1', name: 'Alpha Centari' }]
}

const Planet = {
  all({ limit = Infinity, offset = 0 } = {}) {
    return Promise.resolve(SOLAR_DATA.Planet.slice(offset, offset + limit))
  },
  star: jest.fn(async (planet, args, repo) => {
    let records = await repo.fetch('Star', 'all')

    return find(records, { id: planet.star })
  })
}

const Star = {
  all() {
    return Promise.resolve(SOLAR_DATA.Star)
  },
  planets: jest.fn(async (star, args, repo) => {
    let records = await repo.fetch('Planet', 'all')

    return find(records, { star: star.id })
  })
}

export class SolarSystem extends Repo {
  static defaults = {
    schema: SOLAR_SCHEMA
  }

  setup() {
    this.addDomain('Planet', {
      entity: Planet
    })

    this.addDomain('Star', {
      entity: Star
    })

    this.addDomain('Query', {
      entity: {
        planet: jest.fn(async (_root, args, repo) => {
          let records = await repo.fetch('Planet', 'all', args)

          return find(records, args)
        }),
        planets: jest.fn(async (_root, args, repo) => {
          let records = await repo.fetch('Planet', 'all', args)
          return filter(records, args)
        }),
        paginatedPlanets: (_root, args, repo) => {
          return repo.fetch('Planet', 'all', args)
        },
        star: jest.fn(async (_root, args, repo) => {
          let records = await repo.fetch('Star', 'all', args)

          return find(records, args)
        }),
        stars: jest.fn(async (_root, args, repo) => {
          let records = await repo.fetch('Star', 'all', args)

          return find(records, args)
        })
      }
    })
  }
}
