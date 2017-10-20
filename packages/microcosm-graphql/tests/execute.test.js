import Repo from '../src/repo'
import { SOLAR_SCHEMA, SOLAR_DATA } from './fixtures/solar'
import gql from 'graphql-tag'

function delay(n, payload) {
  return new Promise(resolve => setTimeout(() => resolve(payload), n))
}

describe('Execute', function() {
  it.skip('provides the type name', async () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA })

    repo.reset(SOLAR_DATA)

    let query = repo.compile(
      gql`
        {
          planet(name: Venus) {
            __typename
          }
        }
      `
    )

    let context = { repo, variables: {}, state: repo.state }
    let answer = await query(repo.state, context)

    expect(query).toHaveProperty('planet.__typename', 'Planet')
  })

  it.only('caches lookups', async () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA })

    let getStar = jest.fn((planet, args, stars) => {
      return stars.find(star => star.id === planet.star)
    })

    repo.addQuery('Planet', {
      star: getStar
    })

    repo.reset(SOLAR_DATA)

    let query = repo.compile(
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

    let answer = await query(repo.state, {
      repo,
      variables: {},
      state: repo.state
    })

    expect(getStar).toHaveBeenCalledTimes(1)

    expect(answer).toHaveProperty('a')
    expect(answer).toHaveProperty('b')

    expect(answer.a).toBe(answer.b)
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

  it('link test', async () => {
    let repo = new Repo({ schema: SOLAR_SCHEMA }, SOLAR_DATA)

    let query = repo.compile(
      gql`
        {
          planet(name: Venus) {
            name
            star {
              name
            }
          }
        }
      `
    )

    let context = { repo, variables: { name: 'Venus' }, state: repo.state }

    var then = process.hrtime()
    let answer = await query(repo.state, context)
    console.log(process.hrtime(then)[1] / 1000000)

    expect(answer.planet).toHaveProperty('star.name', 'Sol')
  })
})
