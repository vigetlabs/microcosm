import Repo from '../src/repo'
import { SOLAR_SCHEMA, SOLAR_DATA } from './fixtures/solar'
import gql from 'graphql-tag'

function delay(n) {
  return new Promise(resolve => setTimeout(resolve, n))
}

describe('Execute', function() {
  it('provides the type name', () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)

    let query = repo.query(
      gql`
        {
          planet(name: Venus) {
            __typename
          }
        }
      `
    )

    expect(query).toHaveProperty('planet.__typename', 'Planet')
  })

  it('caches lookups', () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)
    let getStar = jest.fn((planet, args, stars) => {
      return stars.find(star => star.id === planet.star)
    })

    repo.addQuery('Planet', {
      star: { resolver: getStar }
    })

    repo.query(
      gql`
        {
          a: planets(name: Venus) {
            star {
              name
            }
          }
          b: planets(name: Venus) {
            star {
              name
            }
          }
        }
      `
    )

    expect(getStar).toHaveBeenCalledTimes(1)
  })

  // TODO: With the same identifier, could this be cached?
  it('does not cache lookups for different arguments', () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)
    let getStar = jest.fn((root, args, stars) => {
      return stars.find(star => star.id === root.star)
    })

    repo.addQuery('Planet', {
      star: { resolver: getStar }
    })

    repo.query(
      gql`
        {
          a: planets(name: Venus) {
            star {
              name
            }
          }
          b: planets(name: Earth) {
            star {
              name
            }
          }
        }
      `
    )

    expect(getStar).toHaveBeenCalledTimes(2)
  })

  it('caches nested lookups', () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)
    let getStar = jest.fn((root, args, stars) => {
      return stars.find(star => star.id === root.star)
    })

    let getStarPlanets = jest.fn((root, args, planets) => {
      return planets.find(planet => planet.star === root.id)
    })

    repo.addQuery('Planet', {
      star: {
        resolver: getStar
      }
    })

    repo.addQuery('Star', {
      planets: {
        resolver: getStarPlanets
      }
    })

    repo.query(
      gql`
        {
          planets {
            star {
              planets {
                star {
                  name
                }
              }
            }
          }
        }
      `
    )

    // Once for each planet
    expect(getStar).toHaveBeenCalledTimes(3)
    expect(getStarPlanets).toHaveBeenCalledTimes(1)
  })

  it('builds relationships for single fields', () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)

    let answer = repo.query(
      gql`
        {
          planet(name: Venus) {
            star {
              name
            }
          }
        }
      `
    )

    expect(answer.planet.star.name).toEqual('Sol')
  })

  it.only('link test', async () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)

    repo.addQuery('Planet', {
      name: {
        resolver: function* generator(root) {
          yield root.name
          yield root.name.toUpperCase()
        }
      }
    })

    let query = repo.compile(
      gql`
        {
          planet(name: Venus) {
            name
          }
        }
      `
    )

    let context = { repo, variables: { name: 'Venus' }, state: repo.state }

    let answer = query(repo.state, context)

    await delay(1000)

    console.dir(answer, { colors: true, depth: null })
  })
})
