import { Observable } from 'microcosm'

describe('Observable', function() {
  describe('.wrap', async () => {
    it('wraps promises', async () => {
      expect.assertions(1)

      let wrapped = Observable.wrap(Promise.resolve(true))

      wrapped.subscribe({
        next: value => {
          expect(value).toBe(true)
        }
      })

      await wrapped
    })

    it('wraps primitive values', async () => {
      expect.assertions(1)

      let wrapped = Observable.wrap(true)

      wrapped.subscribe({
        next: value => {
          expect(value).toBe(true)
        }
      })

      await wrapped
    })
  })

  describe('.hash', function() {
    it('works on promises', async () => {
      expect.assertions(1)

      let hash = Observable.hash({ key: Promise.resolve(true) })

      hash.subscribe({
        complete: () => {
          expect(hash.payload).toEqual({ key: true })
        }
      })

      await hash
    })

    it('works on primitive values', async () => {
      expect.assertions(1)

      let hash = Observable.hash({ key: true })

      hash.subscribe({
        next: value => {
          expect(value).toEqual({ key: true })
        }
      })

      await hash
    })

    it('works on other observables', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let hash = Observable.hash({ key: Observable.of(1, 2, 3) })

      hash.subscribe({
        next,
        complete
      })

      await hash

      expect(next).toHaveBeenCalledWith({ key: 3 })
      expect(complete).toHaveBeenCalled()
    })

    it('does not send updates if the value did not change', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let hash = Observable.hash({ key: Observable.of(1, 1, 1) })

      hash.subscribe({
        next,
        complete
      })

      await hash

      expect(next).toHaveBeenCalledWith({ key: 1 })
      expect(next).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledTimes(1)
    })
  })
})
