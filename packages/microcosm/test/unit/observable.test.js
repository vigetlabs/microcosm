import { Observable } from 'microcosm'

describe('Observable', function() {
  describe('subscriber', function() {
    it('fires the error callback errors if the subscriber raises an exception', () => {
      expect.assertions(1)

      let observable = new Observable(observer => {
        throw 'Terrible things'
      })

      observable.subscribe({
        error(reason) {
          expect(reason).toEqual('Terrible things')
        }
      })
    })
  })

  describe('duplicate closers', function() {
    it('can not double complete', function() {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
        observer.complete()
      })

      observable.subscribe({ complete })

      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('can not send next after completion', function() {
      let next = jest.fn()
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
        observer.next()
      })

      observable.subscribe({ next, complete })

      expect(next).toHaveBeenCalledTimes(0)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('can not double cancel', function() {
      let cancel = jest.fn()

      let observable = new Observable(observer => {
        observer.cancel()
        observer.cancel()
      })

      observable.subscribe({ cancel })

      expect(cancel).toHaveBeenCalledTimes(1)
    })

    it('raises on the second error call', function() {
      expect.assertions(3)

      let error = jest.fn()

      let observable = new Observable(observer => {
        observer.error('one')
        observer.error('two')
      })

      try {
        observable.subscribe({ error })
      } catch (x) {
        expect(x).toBe('two')
      }

      expect(error).toHaveBeenCalledTimes(1)
      expect(error).toHaveBeenCalledWith('one')
    })

    it('raises if erroring after completion', function() {
      expect.assertions(2)

      let error = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
        observer.error('Bad news')
      })

      try {
        observable.subscribe({ error })
      } catch (x) {
        expect(x).toBe('Bad news')
      }

      expect(error).toHaveBeenCalledTimes(0)
    })

    it('can not complete after erroring', function() {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.error()
        observer.complete()
      })

      observable.subscribe({ complete })

      expect(complete).toHaveBeenCalledTimes(0)
    })

    it('can not cancel after erroring', function() {
      let cancel = jest.fn()

      let observable = new Observable(observer => {
        observer.error()
        observer.cancel()
      })

      observable.subscribe({ cancel })

      expect(cancel).toHaveBeenCalledTimes(0)
    })
  })

  describe('subscribe', function() {
    it('raises if not given an observer', () => {
      expect.assertions(1)

      let observable = new Observable(observer => {
        throw 'Terrible things'
      })

      try {
        observable.subscribe(null)
      } catch (x) {
        expect(x.message).toBe('Unable to subscribe to null')
      }
    })

    it('subscribes to next as the first argument', () => {
      let next = jest.fn()

      let observable = new Observable(observer => {
        observer.next(2)
        observer.complete()
      })

      observable.subscribe(next)

      expect(next).toHaveBeenCalledWith(2)
    })

    it('subscribes to error as the second argument', () => {
      let error = jest.fn()

      let observable = new Observable(observer => {
        throw 'Exceptional!'
      })

      observable.subscribe(() => {}, error)

      expect(error).toHaveBeenCalledWith('Exceptional!')
    })

    it('subscribes to complete as the third argument', () => {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
      })

      observable.subscribe(() => {}, () => {}, complete)

      expect(complete).toHaveBeenCalled()
    })
  })

  describe('cleanup', function() {
    it('executes a clean up method when cancelled', () => {
      let cleaned = false

      let observable = new Observable(observer => {
        observer.complete()
        return () => {
          cleaned = true
        }
      })

      observable.subscribe(n => n)

      expect(cleaned).toBe(true)
    })

    it.dev('raises if cleanup is not a function', () => {
      expect.assertions(1)

      let observable = new Observable(observer => {
        observer.complete()
        return true
      })

      try {
        observable.subscribe(n => n)
      } catch (x) {
        expect(x.message).toEqual('true is not a function')
      }
    })
  })

  describe('cancellation', function() {
    it('can kill all active subscriptions', function() {
      let observer = new Observable(observer => {
        observer.next(2)
      })

      let cancel = jest.fn()

      observer.subscribe({ cancel })
      observer.subscribe({ cancel })

      observer.cancel('Nevermind')

      expect(cancel).toHaveBeenCalledTimes(2)
      expect(cancel).toHaveBeenCalledWith('Nevermind')
    })

    it('invokes cleanup', async function() {
      let observer = new Observable(observer => {
        observer.next(2)

        let timer = setTimeout(observer.complete, 0)

        return () => clearTimeout(timer)
      })

      let complete = jest.fn()

      observer.subscribe({ complete })

      observer.cancel('Nevermind')

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(complete).toHaveBeenCalledTimes(0)
    })
  })

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
})
