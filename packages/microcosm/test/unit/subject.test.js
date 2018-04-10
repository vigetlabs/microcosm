import { Subject, Observable } from 'microcosm'

describe('Subject', function() {
  describe('next', function() {
    it('emits an update', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.next(1)
      subject.next(2)

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(2)
    })

    it('can be subscribed to mid-update', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.next(1)
      subject.subscribe({ next })
      subject.next(2)

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(2)
    })

    it('does not update the payload if given null', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.next(1)
      subject.next(null)

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(1)
    })

    it('triggers if next only once after being completed', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.complete(1)
      subject.subscribe({ next })
      subject.next(2)

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(1)
    })

    it('does not trigger after being completed', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.complete()
      subject.next(true)

      expect(next).toHaveBeenCalledTimes(0)
    })

    it('does not trigger after erroring', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.error()
      subject.subscribe({ next })
      subject.next(true)

      expect(next).toHaveBeenCalledTimes(0)
    })

    it('does not trigger after cancelling', () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.cancel()
      subject.subscribe({ next })
      subject.next(true)

      expect(next).toHaveBeenCalledTimes(0)
    })
  })

  describe('complete', function() {
    it('triggers once', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.subscribe({ complete })

      subject.complete()
      subject.complete()

      expect(subject.closed).toBe(true)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('triggers if already completed', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.complete()
      subject.subscribe({ complete })

      expect(subject.closed).toBe(true)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('does not trigger unsubscribe', () => {
      let subject = new Subject()
      let unsubscribe = jest.fn()

      subject.subscribe({ unsubscribe })
      subject.complete(true)

      expect(unsubscribe).not.toHaveBeenCalled()
    })
  })

  describe('error', function() {
    it('invokes the error again if already errored', () => {
      let subject = new Subject()
      let error = jest.fn()

      subject.error()
      subject.subscribe({ error })

      expect(error).toHaveBeenCalled()
    })

    it('does not invoke the error if already completed', () => {
      let subject = new Subject()
      let error = jest.fn()

      subject.subscribe({ error })
      subject.complete()
      subject.error()

      expect(error).not.toHaveBeenCalled()
    })
  })

  describe('cancel', function() {
    it('becomes closed when cancelled', function() {
      let subject = new Subject()

      subject.cancel()

      expect(subject.closed).toBe(true)
    })

    it('cancel is a one time binding', function() {
      let subject = new Subject()
      let cancel = jest.fn()

      subject.subscribe({ cancel })

      subject.cancel()
      subject.cancel()

      expect(cancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('then', function() {
    it('resolves when completed', async () => {
      let subject = new Subject()

      setTimeout(() => subject.complete(true))

      expect(await subject).toEqual(true)
    })

    it('rejects when it fails', async () => {
      let subject = new Subject()

      setTimeout(() => subject.error('sorry'))

      try {
        await subject
      } catch (error) {
        expect(error).toBe('sorry')
      }
    })
  })

  describe('toString', function() {
    it('stringifies to its tag name', () => {
      expect(new Subject(null, { key: 'foobar' }).toString()).toBe('foobar')
    })

    it('stringifies to "Subject" when given no key', () => {
      expect(new Subject(null).toString()).toBe('Subject')
    })
  })

  describe('toJSON', function() {
    it('generates a POJO', () => {
      let subject = new Subject(true, { key: 'foobar' })

      subject.complete()

      expect(subject.toJSON()).toEqual({
        payload: true,
        status: 'complete',
        key: 'foobar'
      })
    })
  })

  describe('Symbol("observable")', function() {
    it('returns itself', () => {
      let subject = new Subject()

      expect(Observable.wrap(subject)).toBe(subject)
    })
  })

  describe('.hash', function() {
    it('works on promises', async () => {
      expect.assertions(1)

      let hash = Subject.hash({ key: Promise.resolve(true) })

      hash.subscribe({
        complete: () => {
          expect(hash.payload).toEqual({ key: true })
        }
      })

      await hash
    })

    it('works on primitive values', async () => {
      expect.assertions(1)

      let hash = Subject.hash({ key: true })

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

      let hash = Subject.hash({ key: Observable.of(1, 2, 3) })

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

      let hash = Subject.hash({
        key: Observable.of(1, 1, 1)
      })

      hash.subscribe({
        next,
        complete
      })

      await hash

      expect(next).toHaveBeenCalledWith({ key: 1 })
      expect(next).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('works on subjects', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let subject = new Subject()

      subject.next(1)

      let hash = Subject.hash({ key: subject })

      hash.subscribe({ next, complete })

      subject.next(2)
      subject.complete()

      await hash

      expect(next).toHaveBeenCalledWith({ key: 1 })
      expect(next).toHaveBeenCalledWith({ key: 2 })
      expect(complete).toHaveBeenCalled()
    })
  })

  describe('.map', () => {
    it('works like observable.map', () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      double.subscribe(value => answers.push(value))

      for (var i = 0; i < 5; i++) {
        subject.next(i)
      }

      expect(answers).toEqual([0, 2, 4, 6, 8])
    })

    it('starts with the current value', () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      subject.next(5)

      double.subscribe(value => answers.push(value))

      expect(answers).toEqual([10])
    })

    it('only maps over the current and new iterations', () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      subject.next(0)
      subject.next(1)
      double.subscribe(value => answers.push(value))
      subject.next(2)
      subject.next(3)

      expect(answers).toEqual([2, 4, 6])
    })

    it('only emits the final value when it completes', () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      subject.next(0)
      subject.next(1)
      subject.complete()
      double.subscribe(value => answers.push(value))
      subject.next(2)
      subject.next(3)

      expect(answers).toEqual([2])
    })
  })
})
