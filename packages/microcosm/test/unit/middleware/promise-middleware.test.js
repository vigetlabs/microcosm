import { Microcosm, scheduler } from 'microcosm'
import { withUniqueScheduler } from '../../helpers'

describe('Promise middleware', function() {
  it('completes when a promise resolves', async function() {
    const repo = new Microcosm()

    await repo.push(n => Promise.resolve(n))
  })

  it('errors when a promise rejects', async function() {
    const repo = new Microcosm()

    try {
      await repo.push(n => Promise.reject(n), false)
    } catch (error) {
      expect(error).toBe(false)
    }
  })

  it('rejects when a promise throws an error', async function() {
    const repo = new Microcosm()

    try {
      await repo.push(
        n =>
          new Promise(() => {
            throw 'error'
          }),
        false
      )
    } catch (error) {
      expect(error).toBe('error')
    }
  })

  it('handles successful chains', async function() {
    const repo = new Microcosm()

    let payload = await repo.push(function asPromised(value) {
      return Promise.resolve().then(() => value)
    }, true)

    expect(payload).toBe(true)
  })

  it('handles failed chains', async function() {
    const repo = new Microcosm()

    try {
      await repo.push(
        n => Promise.resolve().then(() => Promise.reject('error')),
        true
      )
    } catch (error) {
      expect(error).toBe('error')
    }
  })

  it('handles failed chains that raise errors', async function() {
    const repo = new Microcosm()

    try {
      await repo.push(() =>
        Promise.resolve().then(() => {
          throw 'error'
        })
      )
    } catch (error) {
      expect(error).toBe('error')
    }
  })

  describe('promise error trapping', () => {
    withUniqueScheduler()

    it('does not trap errors in domain handlers', async function() {
      const repo = new Microcosm()
      const onError = jest.fn()

      repo.addDomain('test', {
        register() {
          return {
            action: () => {
              throw 'Oops'
            }
          }
        }
      })

      scheduler().onError(onError)

      await repo.push('action')

      expect(onError).toHaveBeenCalledWith('Oops')
    })

    it('does not trap errors in effect handlers', async function() {
      const repo = new Microcosm()
      const onError = jest.fn()

      repo.addEffect({
        register() {
          return {
            action: () => {
              throw 'Oops'
            }
          }
        }
      })

      scheduler().onError(onError)

      await repo.push('action')

      expect(onError).toHaveBeenCalledWith('Oops')
    })
  })
})
