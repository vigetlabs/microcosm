import { Microcosm, Observable } from 'microcosm'
import { EventEmitter } from 'events'

describe('Observable domains', function() {
  it('can synchronize state from an outside source', function() {
    let repo = new Microcosm()
    let handler = jest.fn()

    let emitter = new EventEmitter()

    let socket = new Observable(observer => {
      emitter.on('change', observer.next)
      return () => emitter.removeListener('change', observer.next)
    })

    repo.addDomain('socket', socket).subscribe(handler)

    emitter.emit('change', 'test')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith('test')
  })

  it('calls the cleanup method when the repo tears down', function() {
    let repo = new Microcosm()
    let handler = jest.fn()

    let emitter = new EventEmitter()
    let socket = new Observable(observer => {
      emitter.on('change', observer.next)
      return () => emitter.removeListener('change', observer.next)
    })

    repo.addDomain('socket', socket).subscribe(handler)

    repo.complete()

    emitter.emit('change', 'test')

    expect(handler).not.toHaveBeenCalled()
  })
})
