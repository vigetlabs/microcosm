import Microcosm from 'microcosm'
import { Location, push, replace, go, goBack, goForward } from '../src/index'
import createMemoryHistory from 'history/createMemoryHistory'

describe('Navigation', function() {
  let history, repo

  beforeEach(function() {
    repo = new Microcosm()
    history = createMemoryHistory()

    repo.addDomain('location', Location, { history })
  })

  it('pushes to history', () => {
    expect(repo.state.location.pathname).toEqual('/')
    repo.push(push, '/foo')
    expect(repo.state.location.pathname).toEqual('/foo')
  })

  it('replaces history', () => {
    expect(history.length).toBe(1)

    repo.push(replace, '/foo')
    expect(repo.state.location.pathname).toEqual('/foo')

    expect(history.length).toBe(1)
  })

  it('goes back and forth', () => {
    repo.push(push, '/foo')
    expect(repo.state.location.pathname).toEqual('/foo')

    repo.push(goBack)
    expect(repo.state.location.pathname).toEqual('/')

    repo.push(goForward)
    expect(repo.state.location.pathname).toEqual('/foo')
  })

  it('can visit an index', () => {
    repo.push(push, '/foo')
    repo.push(push, '/bar')
    repo.push(push, '/baz')

    repo.push(go, -1)
    expect(repo.state.location.pathname).toEqual('/bar')

    repo.push(go, -1)
    expect(repo.state.location.pathname).toEqual('/foo')

    repo.push(go, 2)
    expect(repo.state.location.pathname).toEqual('/baz')
  })
})
