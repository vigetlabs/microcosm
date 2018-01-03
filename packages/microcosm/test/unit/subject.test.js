import { Subject } from 'microcosm'

describe('Subject', function() {
  describe('start', function() {
    it('moves into a started state when it is subscribed to', () => {
      let subject = new Subject()

      subject.subscribe(n => n)

      expect(subject.status).toBe('start')
    })

    it('triggers the start hook when subscribed to', () => {
      let subject = new Subject()
      let start = jest.fn()

      subject.subscribe({ start })

      expect(start).toHaveBeenCalledTimes(1)
    })

    it('does not move into start if it has updated before a subscription', () => {
      let subject = new Subject()

      subject.next(true)
      subject.subscribe(n => n)

      expect(subject.status).toBe('next')
    })
  })

  describe('next', function() {
    it('moves into a next state', () => {
      let subject = new Subject()

      subject.subscribe(n => n)

      subject.next(true)

      expect(subject.status).toBe('next')
    })
  })

  describe('complete', function() {
    it('sets an complete state when it finishes', () => {
      let subject = new Subject()

      subject.complete(true)

      expect(subject.status).toBe('complete')
    })

    it('triggers once', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.subscribe({ complete })

      subject.complete()
      subject.complete()

      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('triggers if already completed', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.complete()
      subject.subscribe({ complete })

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

  describe('unsubscribe', function() {
    it('invokes the unsubscribe subscription', () => {
      let subject = new Subject()
      let unsubscribe = jest.fn()

      subject.subscribe({ unsubscribe })

      subject.unsubscribe()

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('does not trigger on error', () => {
      let subject = new Subject()
      let unsubscribe = jest.fn()
      let error = jest.fn()

      subject.subscribe({ error, unsubscribe })
      subject.error(true)

      expect(unsubscribe).not.toHaveBeenCalled()
      expect(error).toHaveBeenCalledWith(true)
    })

    it('does not trigger on complete', () => {
      let subject = new Subject()
      let unsubscribe = jest.fn()
      let complete = jest.fn()

      subject.subscribe({ complete, unsubscribe })
      subject.complete()

      expect(unsubscribe).not.toHaveBeenCalled()
      expect(complete).toHaveBeenCalled()
    })
  })

  describe('error', function() {
    it('sets an error state when it errors', () => {
      let subject = new Subject()

      subject.error(true)

      expect(subject.status).toBe('error')
    })

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
})
