import { Subject } from 'microcosm'

describe('Subject', function() {
  it('moves into a started state when it is subscribed to', () => {
    let subject = new Subject()

    subject.subscribe(n => n)

    expect(subject.status).toBe('start')
  })

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
})
