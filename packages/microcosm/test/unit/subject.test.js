import { Subject } from 'microcosm'

describe('Subject', function() {
  it('triggers the start hook when subscribed to', () => {
    let subject = new Subject()
    let start = jest.fn()

    subject.subscribe({ start })

    expect(start).toHaveBeenCalledTimes(1)
  })

  describe('next', function() {
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

      subject.subscribe({ next })
      subject.error()
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

      expect(subject).toHaveProperty('closed', true)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('triggers if already completed', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.complete()
      subject.subscribe({ complete })

      expect(subject).toHaveProperty('closed', true)
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

    it('can listen to another unsubscribe command', () => {
      let subject = new Subject()
      let other = new Subject()
      let unsubscribe = jest.fn()

      subject.subscribe(other)
      other.subscribe({ unsubscribe })
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
