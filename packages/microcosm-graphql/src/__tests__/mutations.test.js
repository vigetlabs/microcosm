import Repo from '../repo'
import gql from 'graphql-tag'

describe('CRUD', function() {
  let schema = gql`
    type Author {
      id: ID
      name: Name
    }

    type Query {
      authors: [Author]
    }

    type Mutation {
      addAuthor(name: String): Author
      removeAuthor(id: String): Author
      updateAuthor(id: String, name: String): Author
    }
  `

  it('adds', async () => {
    let repo = new Repo({ schema })
    let filbert = await repo.push('addAuthor', { name: 'Filbert' })

    expect(filbert).toHaveProperty('id')
    expect(filbert).toHaveProperty('name', 'Filbert')

    expect(repo.state.Author).toContain(filbert)
  })

  it('removes', async () => {
    let repo = new Repo({ schema })

    repo.reset({
      Author: [{ id: 0, name: 'Filbert' }, { id: 1, name: 'Billy' }]
    })

    repo.push('removeAuthor', { id: 0 })

    expect(repo.state.Author).toEqual([{ id: 1, name: 'Billy' }])
  })

  it('updates', async () => {
    let repo = new Repo({ schema })

    repo.reset({
      Author: [{ id: 0, name: 'Filbert' }, { id: 1, name: 'Fran' }]
    })

    repo.push('updateAuthor', { id: 1, name: 'Billy' })

    expect(repo.state.Author[1]).toEqual({ id: 1, name: 'Billy' })
  })

  it('appends the record if it is missing', async () => {
    let repo = new Repo({ schema })

    repo.push('updateAuthor', { id: 0, name: 'Billy' })

    expect(repo.state.Author).toEqual([{ id: 0, name: 'Billy' }])
  })
})
