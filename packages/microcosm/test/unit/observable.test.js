import { Observable, Subject } from 'microcosm'

test('cancelling an action prevents it from completing', function() {
  let subject = new Subject()
  let complete = jest.fn()
  let cancel = jest.fn()

  subject.subscribe({ complete })
  subject.subscribe({ cancel })

  subject.cancel()
  subject.complete()

  expect(cancel).toHaveBeenCalled()
  expect(complete).not.toHaveBeenCalled()
})

test('cancelling an action triggers cleanup', function() {
  let cancel = jest.fn()
  let complete = jest.fn()

  let observable = new Observable(observer => {
    observer.cancel()

    return cancel
  })

  observable.subscribe({ complete })

  expect(cancel).toHaveBeenCalled()
  expect(complete).not.toHaveBeenCalled()
})
