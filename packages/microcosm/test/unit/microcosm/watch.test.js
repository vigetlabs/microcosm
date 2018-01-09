import { Microcosm, patch } from 'microcosm'

describe('Microcosm::watch', function() {
  it('follows a value', function() {
    const repo = new Microcosm()
    const handler = jest.fn()

    repo.addDomain('test', {
      getInitialState() {
        return true
      }
    })

    repo.watch('test').subscribe(handler)

    repo.push(patch, { test: false })

    expect(handler).toHaveBeenCalledWith(false)
  })
})
