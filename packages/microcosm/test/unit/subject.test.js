import { Subject } from 'microcosm'

describe('Subject', function() {
  it('moves into a next state when it pushes an action to', () => {
    let subject = new Subject()

    subject.subscribe(n => n)

    subject.next(true)

    expect(subject.status).toBe('next')
  })

  it('does not move into start if it has updated before a subscription', () => {
    let subject = new Subject()

    subject.next(true)
    subject.subscribe(n => n)

    expect(subject.status).toBe('next')
  })

  it('sets an error state when it errors', () => {
    let subject = new Subject()

    subject.error(true)

    expect(subject.status).toBe('error')
  })

  it('sets an complete state when it finishes', () => {
    let subject = new Subject()

    subject.complete(true)

    expect(subject.status).toBe('complete')
  })

  it('a subjects payload can intentionally be set to undefined', async () => {
    let subject = new Subject()

    subject.next(true)
    subject.complete(undefined)

    expect(subject.payload).toBe(undefined)
  })

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
  })

  describe('complete', function() {
    it('triggers once', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.subscribe({ complete })
      subject.complete(true)

      expect(complete).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledWith(true)
    })

    it('triggers if already completed', () => {
      let subject = new Subject()
      let complete = jest.fn()

      subject.complete(true)
      subject.subscribe({ complete })

      expect(complete).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledWith(true)
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
  })

  describe('error', function() {
    it('invokes the error again if already errored', () => {
      let subject = new Subject()
      let error = jest.fn()

      subject.error()
      subject.subscribe({ error })

      expect(error).toHaveBeenCalled()
    })
  })
})
