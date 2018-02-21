import Microcosm from 'microcosm'

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

    let payload = await repo.push(n => Promise.resolve().then(() => n), true)

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
})
