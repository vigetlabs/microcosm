import Microcosm from 'microcosm'

const reject = n => Promise.reject(n)

describe('Subject error state', function() {
  it('exposes an error type when it errors', async () => {
    const repo = new Microcosm()
    const action = repo.push(reject)

    try {
      await action
    } catch (x) {
      expect(action.status).toBe('error')
    }
  })

  it('listens to failures', async () => {
    const repo = new Microcosm()
    const action = repo.push(reject, true)
    const error = jest.fn()

    action.subscribe({ error })

    try {
      await action
    } catch (x) {
      expect(error).toHaveBeenCalledWith(true)
    }
  })
})
