import gql from 'graphql-tag'
import Repo from '../../src/repo'
import { find, filter } from '../../src/utilities'
import { uniqBy } from 'lodash'

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

export class SolarSystem extends Repo {
  static defaults = {
    schema: SOLAR_SCHEMA
  }

  setup() {
    this.addDomain('Planet', {
      actions: {
        getPlanets: ({ limit = Infinity, offset = 0 } = {}) => {
          return Promise.resolve(
            SOLAR_DATA.Planet.slice(offset, offset + limit)
          )
        }
      },
      getInitialState() {
        return []
      },
      register() {
        return {
          getPlanets: (old, next) => {
            return uniqBy(old.concat(next), 'id')
          }
        }
      }
    })

    this.addDomain('Star', {
      actions: {
        getStars: () => {
          return Promise.resolve(SOLAR_DATA.Star)
        }
      },
      getInitialState() {
        return []
      },
      register() {
        return {
          getStars: (old, next) => next
        }
      }
    })

    this.addQuery('Query', {
      planet: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getPlanets')
        }),
        resolver: jest.fn((_, args, { Planet }) => {
          return find(Planet, args)
        })
      },
      planets: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getPlanets')
        }),
        resolver: jest.fn((_, args, { Planet }) => {
          return filter(Planet, args)
        })
      },
      paginatedPlanets: {
        prepare: (repo, args) => {
          return repo.push('getPlanets', args)
        },
        resolver: (_, args, { Planet }, result = []) => {
          return result.map(item => {
            return find(Planet, { id: item.id })
          })
        }
      },
      star: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getStars')
        }),
        resolver: jest.fn((_, args, { Star }) => {
          return find(Star, args)
        })
      },
      stars: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getStars')
        }),
        resolver: jest.fn((_, args, { Star }) => {
          return filter(Star, args)
        })
      }
    })

    this.addQuery('Planet', {
      star: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getStars')
        }),
        resolver: jest.fn((planet, args, { Star }) => {
          return find(Star, args)
        })
      },
      stars: {
        prepare: jest.fn((repo, args) => {
          return repo.push('getStars')
        }),
        resolver: jest.fn((planet, args, { Star }) => {
          return filter(Star, args)
        })
      }
    })
  }
}
