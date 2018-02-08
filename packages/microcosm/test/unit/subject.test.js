import { Subject, Observable } from 'microcosm'

describe('Subject', function() {
  describe('start', function() {
    it('triggers the start hook when subscribed to', () => {
      let subject = new Subject()
      let start = jest.fn()

      subject.subscribe({ start })

      expect(start).toHaveBeenCalledTimes(1)
    })
  })

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
    it('calls the clean up function of observables when it is cancelled', function() {
      let subject = new Subject()
      let cleanup = jest.fn()

      subject.subscribe({ cleanup })
      subject.cancel()

      expect(cleanup).toHaveBeenCalledTimes(1)
    })

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
      expect(`${new Subject(null, { tag: 'foobar' })}`).toBe('foobar')
    })

    it('stringifies to "Subject" when given no tag', () => {
      expect(`${new Subject(null)}`).toBe('Subject')
    })
  })

  describe('toJSON', function() {
    it('generates a POJO', () => {
      let subject = new Subject(true, { tag: 'foobar' })

      subject.complete()

      expect(subject.toJSON()).toEqual({
        payload: true,
        status: 'complete',
        tag: 'foobar'
      })
    })
  })

  describe('Symbol("observable")', function() {
    it('returns itself', () => {
      let subject = new Subject()

      expect(Observable.wrap(subject)).toBe(subject)
    })
  })
})
