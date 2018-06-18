import { Observable, scheduler } from 'microcosm'

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

      scheduler().flush()
    })

    it('cleans up any enqueued tasks on unsubscribe', () => {
      expect.assertions(1)

      let observable = new Observable(observer => {
        throw 'Terrible things'
      })

      observable.subscribe({
        error(reason) {
          expect(reason).toEqual('Terrible things')
        }
      })

      scheduler().flush()
    })
  })

  describe('duplicate completion', function() {
    it('can not double complete', function() {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
        observer.complete()
      })

      observable.subscribe({ complete })

      scheduler().flush()

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

      scheduler().flush()

      expect(next).toHaveBeenCalledTimes(0)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('can not complete after erroring', function() {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.error()
        observer.complete()
      })

      observable.subscribe({ complete })

      scheduler().flush()

      expect(complete).toHaveBeenCalledTimes(0)
    })
  })

  describe('subscribe', function() {
    it('subscribes to next as the first argument', () => {
      let next = jest.fn()

      let observable = new Observable(observer => {
        observer.next(2)
        observer.complete()
      })

      observable.subscribe(next)

      scheduler().flush()

      expect(next).toHaveBeenCalledWith(2)
    })

    it('next can be null', () => {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.next(2)
        observer.complete()
      })

      observable.subscribe(null, null, complete)

      scheduler().flush()

      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('subscribes to error as the second argument', () => {
      let error = jest.fn()

      let observable = new Observable(observer => {
        observer.error('Exceptional!')
      })

      observable.subscribe(() => {}, error)

      scheduler().flush()

      expect(error).toHaveBeenCalledWith('Exceptional!')
    })

    it('triggers error() when the subscription observer throws', () => {
      let error = jest.fn()

      let observable = new Observable(observer => {
        throw 'Exceptional!'
      })

      observable.subscribe(() => {}, error)

      scheduler().flush()

      expect(error).toHaveBeenCalledWith('Exceptional!')
    })

    it('subscribes to complete as the third argument', () => {
      let complete = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
      })

      observable.subscribe(() => {}, () => {}, complete)

      scheduler().flush()

      expect(complete).toHaveBeenCalled()
    })
  })

  describe('cleanup', function() {
    it('executes a clean up method when completed', () => {
      let cleaned = jest.fn()

      let observable = new Observable(observer => {
        observer.complete()
        return cleaned
      })

      observable.subscribe(n => n)

      scheduler().flush()

      expect(cleaned).toHaveBeenCalled()
    })

    it('noops if not given a function', () => {
      let observable = new Observable(observer => {
        observer.complete()
        return true
      })

      observable.subscribe(n => n)

      expect(() => scheduler().flush()).not.toThrow()
    })

    it('the scheduler covers cases when cleanup fails', () => {
      expect.assertions(1)

      let observable = new Observable(observer => {
        observer.complete()

        return () => {
          throw 'Exceptional!'
        }
      })

      observable.subscribe(n => n)

      try {
        scheduler().flush()
      } catch (error) {
        expect(error.message).toContain('Exceptional!')
      }
    })

    it('unsubscribes subscriptions', () => {
      let unsubscribe = jest.fn()

      let range = new Observable(observer => {
        observer.next(1)
        observer.next(2)
        observer.next(3)
        observer.complete()

        return unsubscribe
      })

      let observable = new Observable(observer => {
        return range.subscribe(observer)
      })

      observable.subscribe(jest.fn())

      scheduler().flush()

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('the scheduler covers cases when a nested cleanup method fails', () => {
      expect.assertions(1)

      let range = new Observable(observer => {
        observer.next(1)
        observer.next(2)
        observer.next(3)
        observer.complete()

        return () => {
          throw 'Exceptional!'
        }
      })

      let observable = new Observable(observer => {
        return range.subscribe(observer)
      })

      observable.subscribe(jest.fn())

      try {
        scheduler().flush()
      } catch (error) {
        expect(error.message).toContain('Exceptional!')
      }
    })
  })

  describe('::map', () => {
    it('operates like array.map over a stream of values', () => {
      let double = Observable.of(0, 1, 2, 3, 4).map(value => value * 2)
      let answers = []

      double.subscribe(value => answers.push(value))

      scheduler().flush()

      expect(answers).toEqual([0, 2, 4, 6, 8])
    })

    it('can configure scope', () => {
      let scope = {
        degree: 2,
        multiply(value) {
          return value * this.degree
        }
      }

      let double = Observable.of(0, 1, 2, 3, 4).map(scope.multiply, scope)
      let answers = []

      double.subscribe(value => answers.push(value))

      scheduler().flush()

      expect(answers).toEqual([0, 2, 4, 6, 8])
    })

    it('passes along errors', () => {
      let observable = new Observable(observer => {
        for (var i = 0; i < 5; i++) {
          observer.next(i)
        }
        throw 'Exceptional!'
      })

      let error = jest.fn()

      observable.map(n => n).subscribe({ error })

      scheduler().flush()

      expect(error).toHaveBeenCalledWith('Exceptional!')
    })

    it('raises if not given a function', () => {
      expect(() => Observable.of(0, 1, 2, 3, 4).map()).toThrow(
        'undefined is not a function'
      )
    })
  })

  describe('::filter', () => {
    it('operates like array.filter over a stream of values', () => {
      let isOdd = n => n % 2
      let double = Observable.of(0, 1, 2, 3, 4).filter(isOdd)
      let answers = []

      double.subscribe(value => answers.push(value))

      scheduler().flush()

      expect(answers).toEqual([1, 3])
    })

    it('can configure scope', () => {
      let Maths = {
        threshold: 2,
        greaterThan(value) {
          return value > this.threshold
        }
      }

      let greaterThan2 = Observable.of(2, 4, 6, 8).filter(
        Maths.greaterThan,
        Maths
      )
      let answers = []

      greaterThan2.subscribe(value => answers.push(value))

      scheduler().flush()

      expect(answers).toEqual([4, 6, 8])
    })

    it('passes along errors', () => {
      let observable = new Observable(observer => {
        for (var i = 0; i < 5; i++) {
          observer.next(i)
        }
        throw 'Exceptional!'
      })

      let error = jest.fn()

      observable.filter(n => n).subscribe({ error })

      scheduler().flush()

      expect(error).toHaveBeenCalledWith('Exceptional!')
    })

    it('raises if not given a function', () => {
      expect(() => Observable.of(0, 1, 2, 3, 4).filter()).toThrow(
        'undefined is not a function'
      )
    })
  })
})
