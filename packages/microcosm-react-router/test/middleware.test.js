import Microcosm, { set } from 'microcosm'
import { Location, push } from '../src/index'
import createMemoryHistory from 'history/createMemoryHistory'
import { parse } from 'querystring'

describe('Middleware', function() {
  it('can parse a query string', () => {
    let repo = new Microcosm()

    repo.addDomain('location', Location, {
      history: createMemoryHistory(),
      middleware: [
        location => set(location, 'query', parse(location.search.slice(1)))
      ]
    })

    repo.push(push, { search: 'foobar=true' })

    expect(repo.state.location.query.foobar).toBe('true')
  })
})
