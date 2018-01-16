import Microcosm from 'microcosm'
import { asTree } from '../../helpers'

describe('History node children', function() {
  it('can determine children', function() {
    let repo = new Microcosm({ debug: true })

    let a = repo.push('a')
    repo.push('b')

    repo.history.checkout(a)

    repo.push('c')

    expect(asTree(repo.history)).toMatchSnapshot()
  })

  it('does not lose children when checking out nodes on the left', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('a')

    let b = repo.push('b')
    repo.push('c')

    repo.history.checkout(b)

    repo.push('d')

    expect(asTree(repo.history)).toMatchSnapshot()
  })

  it('does not lose children when checking out nodes on the right', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('a')

    let b = repo.push('b')
    let c = repo.push('c')

    repo.history.checkout(b)

    repo.push('d')

    repo.history.checkout(c)

    expect(asTree(repo.history)).toMatchSnapshot()
  })
})
