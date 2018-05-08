import { Subject, Observable, SubjectMap } from 'microcosm'

describe('SubjectMap', function() {
  describe('primitives', () => {
    it('immedately resolves null', async () => {
      let hash = new SubjectMap(null)

      expect(hash.closed).toBe(true)
      expect(hash.payload).toBe(null)
    })

    it('immedately resolves numbers', async () => {
      let hash = new SubjectMap(10)

      expect(hash.closed).toBe(true)
      expect(hash.payload).toBe(10)
    })

    it('immedately resolves strings', async () => {
      let hash = new SubjectMap('test')

      expect(hash.closed).toBe(true)
      expect(hash.payload).toBe('test')
    })

    it('immedately resolves booleans', async () => {
      let hash = new SubjectMap(true)

      expect(hash.closed).toBe(true)
      expect(hash.payload).toBe(true)
    })
  })

  describe('objects', () => {
    it('immediately resolves simple values', async () => {
      let hash = new SubjectMap({ one: 1, two: 2 })
      let next = jest.fn()

      hash.subscribe({ next })

      await hash

      // Ensure that resolving primitive
      expect(next).toHaveBeenCalledTimes(1)
      expect(hash.payload).toEqual({ one: 1, two: 2 })
    })

    it('resolves promises', async () => {
      let hash = new SubjectMap({ key: Promise.resolve(true) })

      await hash

      expect(hash.payload).toEqual({ key: true })
    })

    it('works on other observables', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let hash = new SubjectMap({ key: Observable.of(1, 2, 3) })

      hash.subscribe({
        next,
        complete
      })

      await hash

      expect(next).toHaveBeenCalledWith({ key: 3 })
      expect(complete).toHaveBeenCalled()
    })

    it('works on subjects', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let subject = new Subject()

      subject.next(1)

      let hash = new SubjectMap({ key: subject })

      hash.subscribe({ next, complete })

      subject.next(2)
      subject.complete()

      await hash

      expect(hash.payload).toEqual({ key: 2 })

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith({ key: 2 })

      expect(complete).toHaveBeenCalled()
    })

    it('starts with the current value of a subject', async () => {
      let subject = new Subject()

      subject.next(1)

      let hash = new SubjectMap({ key: subject })

      expect(hash.payload).toHaveProperty('key', 1)
    })

    it('resolves nests', async () => {
      let hash = new SubjectMap({
        colors: {
          red: Promise.resolve('red'),
          blue: Promise.resolve('blue'),
          green: Promise.resolve('green')
        }
      })

      let next = jest.fn()

      hash.subscribe({ next })

      await hash

      expect(next).toHaveBeenCalledTimes(3)

      expect(next).toHaveBeenCalledWith({
        colors: {
          red: 'red',
          blue: undefined,
          green: undefined
        }
      })

      expect(next).toHaveBeenCalledWith({
        colors: {
          red: 'red',
          blue: 'blue',
          green: undefined
        }
      })

      expect(next).toHaveBeenCalledWith({
        colors: {
          red: 'red',
          blue: 'blue',
          green: 'green'
        }
      })
    })
  })

  describe('arrays', () => {
    it('immediately resolves simple values', async () => {
      let hash = new SubjectMap([1, 2])
      let next = jest.fn()

      hash.subscribe({ next })

      await hash

      // Ensure that resolving primitive
      expect(next).toHaveBeenCalledTimes(1)
      expect(hash.payload).toEqual([1, 2])
    })

    it('resolves async values', async () => {
      let hash = new SubjectMap([Promise.resolve(true), Promise.resolve(false)])

      await hash

      expect(hash.payload).toEqual([true, false])
    })
  })

  describe('updates', () => {
    it('does not send updates if the value did not change', async () => {
      let next = jest.fn()
      let complete = jest.fn()

      let hash = new SubjectMap({
        key: Observable.of(1, 1, 1)
      })

      hash.subscribe({ next, complete })

      await hash

      expect(next).toHaveBeenCalledWith({ key: 1 })
      expect(next).toHaveBeenCalledTimes(1)
      expect(complete).toHaveBeenCalledTimes(1)
    })

    it('sends updates for simple values, then async values later', async () => {
      let next = jest.fn()

      let hash = new SubjectMap({ now: 1, later: Observable.of(1, 2, 3) })

      hash.subscribe({
        next
      })

      expect(hash).toHaveProperty('payload.now', 1)
      expect(hash).toHaveProperty('payload.later', 1)

      await hash

      expect(next).toHaveBeenCalledWith({ now: 1, later: 1 })
      expect(next).toHaveBeenCalledWith({ now: 1, later: 2 })
      expect(next).toHaveBeenCalledWith({ now: 1, later: 3 })

      expect(hash.payload).toEqual({ now: 1, later: 3 })
    })
  })
})
