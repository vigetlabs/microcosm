import Repo from '../src/repo'
import gql from 'graphql-tag'

const schema = gql`
  type Planet {
    id: ID
    name: String
    inner: Boolean
    weight: Int
  }

  type Query {
    planet(id: ID): Planet
  }
`

describe('Arguments', function() {
  it('swaps out variables', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Planet: [
        { id: 0, name: 'Mercury' },
        { id: 1, name: 'Venus' },
        { id: 2, name: 'Earth' }
      ]
    })

    let { planet } = repo.query(
      gql`
        query Planet {
          planet(name: $name) {
            name
          }
        }
      `,
      { name: 'Venus' }
    )

    expect(planet.name).toEqual('Venus')
  })

  it('parses numbers', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Planet: [{ id: 0, name: 'Mercury', order: 1 }]
    })

    let { planet } = repo.query(
      gql`
        query Planet {
          planet(order: 1) {
            name
          }
        }
      `
    )

    expect(planet.name).toEqual('Mercury')
  })

  it('parses single word', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Planet: [{ id: 0, name: 'Mercury', order: 1 }]
    })

    let { planet } = repo.query(
      gql`
        query Planet {
          planet(name: Mercury) {
            name
          }
        }
      `
    )

    expect(planet.name).toEqual('Mercury')
  })

  it('parses multi-word strings with quotes', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Planet: [{ id: 0, name: 'Yavin 4', order: 1 }]
    })

    let { planet } = repo.query(
      gql`
        query Planet {
          planet(name: "Yavin 4") {
            name
          }
        }
      `
    )

    expect(planet.name).toEqual('Yavin 4')
  })

  it('swaps out variables of different names', () => {
    let repo = new Repo({ schema })

    repo.reset({
      Planet: [
        { id: 0, name: 'Mercury' },
        { id: 1, name: 'Venus' },
        { id: 2, name: 'Earth' }
      ]
    })

    let { planet } = repo.query(
      gql`
        query Planet {
          planet(name: $planet) {
            name
          }
        }
      `,
      { planet: 'Venus' }
    )

    expect(planet).toHaveProperty('name', 'Venus')
  })
})
