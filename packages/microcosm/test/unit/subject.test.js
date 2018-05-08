import { Subject } from 'microcosm'

describe('Subject', function() {
  describe('next', function() {
    it('emits an update', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.next(1)
      subject.next(2)
      subject.complete()

      await subject

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(2)
    })

    it('can be subscribed to mid-update', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.next(1)
      subject.subscribe({ next })
      subject.next(2)
      subject.complete()

      await subject

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(2)
    })

    it('does not update the payload if given null', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.next(1)
      subject.next(null)
      subject.complete()

      await subject

      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(1)
      expect(next).toHaveBeenCalledWith(1)
    })

    it('triggers if next only once after being completed', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.complete(1)
      subject.subscribe({ next })
      subject.next(2)

      await subject

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(1)
    })

    it('does not trigger after being completed', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.complete()
      subject.next(true)

      await subject

      expect(next).toHaveBeenCalledTimes(0)
    })

    it('does not trigger after erroring', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.error('reason')
      subject.subscribe({ next })
      subject.next(true)

      try {
        await subject
      } catch (error) {
        expect(error).toEqual('reason')
      }

      expect(next).toHaveBeenCalledTimes(0)
    })

    it('does not trigger after cancelling', async () => {
      let subject = new Subject()
      let next = jest.fn()

      subject.cancel()
      subject.subscribe({ next })
      subject.next(true)

      await subject

      expect(next).toHaveBeenCalledTimes(0)
    })
  })

  describe('complete', function() {
    it('triggers once', async () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.subscribe({ complete })

      subject.complete()
      subject.complete()

      await subject

      expect(subject.closed).toBe(true)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('triggers if already completed', async () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.complete()
      subject.subscribe({ complete })

      await subject

      expect(subject.closed).toBe(true)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('does not trigger unsubscribe', async () => {
      let subject = new Subject()
      let unsubscribe = jest.fn()

      subject.subscribe({ unsubscribe })
      subject.complete(true)

      await subject

      expect(unsubscribe).not.toHaveBeenCalled()
    })
  })

  describe('error', function() {
    it('invokes the error again if already errored', async () => {
      let subject = new Subject()
      let error = jest.fn()

      subject.error('reason')
      subject.subscribe({ error })

      try {
        await subject
      } catch (error) {
        expect(error).toEqual('reason')
      }

      expect(error).toHaveBeenCalledTimes(1)
      expect(error).toHaveBeenCalledWith('reason')
    })

    it('does not invoke the error if already completed', async () => {
      let subject = new Subject()
      let error = jest.fn()

      subject.subscribe({ error })
      subject.complete()
      subject.error()

      await subject

      expect(error).not.toHaveBeenCalled()
    })
  })

  describe('cancel', function() {
    it('becomes closed when cancelled', async () => {
      let subject = new Subject()

      subject.cancel()

      await subject

      expect(subject.closed).toBe(true)
    })
  })

  describe('clear', function() {
    it('resets the subject', function() {
      let subject = new Subject()

      subject.next(true)
      subject.clear()

      expect(subject.status).toBe('start')
      expect(subject.payload).toBe(null)
      expect(subject.closed).toBe(false)
    })

    it('cancels observers', function() {
      let subject = new Subject()
      let next = jest.fn()

      subject.subscribe({ next })
      subject.clear()
      subject.next(1)

      expect(next).not.toHaveBeenCalled()
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

  describe('toJSON', function() {
    it('generates a POJO', () => {
      let subject = new Subject()

      subject.next(true)
      subject.complete()

      expect(subject.toJSON()).toEqual({
        key: 'subject',
        payload: true,
        status: 'complete'
      })
    })
  })

  describe('Symbol("observable")', function() {
    it('returns itself', () => {
      let subject = new Subject()

      expect(Subject.from(subject)).toBe(subject)
    })
  })

  describe('.map', () => {
    it('works like observable.map', async () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      double.subscribe(value => answers.push(value))

      for (var i = 0; i < 5; i++) {
        subject.next(i)
      }

      subject.complete()

      await subject

      expect(answers).toEqual([0, 2, 4, 6, 8])
    })

    it('starts with the current value', () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      subject.next(5)
      double.subscribe(value => answers.push(value))
      subject.complete()

      // Mapping over a subject should be immediate
      expect(answers).toEqual([10])
    })

    it('only maps over the current and new iterations', async () => {
      let subject = new Subject()

      let double = subject.map(value => value * 2)
      let answers = []

      subject.next(0)
      subject.next(1)
      double.subscribe(value => answers.push(value))
      subject.next(2)
      subject.next(3)
      subject.complete()

      await subject

      expect(answers).toEqual([2, 4, 6])
    })

    it('only emits the final value when it completes', async () => {
      let subject = new Subject()

      let reflect = subject.map(value => value)
      let answers = []

      subject.next(0)
      subject.next(1)
      subject.complete()
      reflect.subscribe(value => answers.push(value))
      subject.next(2)
      subject.next(3)

      await subject

      expect(answers).toEqual([1])
    })
  })
})
