import Repo from '../src/repo'
import { SOLAR_SCHEMA, SOLAR_DATA } from './fixtures/solar'
import gql from 'graphql-tag'

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
    let getStar = jest.fn((root, args, state) => {
      return state.Star.find(star => star.id === root.star)
    })

    repo.addQuery('Planet', 'star', { resolver: getStar })

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
    let getStar = jest.fn((root, args, state) => {
      return state.Star.find(star => star.id === root.star)
    })

    repo.addQuery('Planet', 'star', { resolver: getStar })

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
    let getStar = jest.fn((root, args, state) => {
      return state.Star.find(star => star.id === root.star)
    })

    let getStarPlanets = jest.fn((root, args, state) => {
      return state.Planet.find(planet => planet.star === root.id)
    })

    repo.addQuery('Planet', 'star', { resolver: getStar })
    repo.addQuery('Star', 'planets', { resolver: getStarPlanets })

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
})
