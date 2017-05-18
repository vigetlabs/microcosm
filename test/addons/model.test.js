import Microcosm from '../../src/microcosm'
import Model from '../../src/addons/model'
import Observable from 'zen-observable'

class Repo extends Microcosm {
  setup() {
    this.addDomain('style', {
      getInitialState() {
        return { color: 'blue' }
      }
    })
  }
}

describe('Model', function() {
  describe('primitives', function() {
    it('passes through primitive values', function() {
      let repo = new Repo()
      let model = new Model(repo)

      model.bind({ test: true })

      expect(model.value).toEqual({ test: true })
    })
  })

  describe('callables', function() {
    it('bindings can be invokable functions', function() {
      let repo = new Repo()

      let model = new Model(repo)

      model.bind({
        upper: state => state.style.color.toUpperCase()
      })

      expect(model.value).toEqual({ upper: 'BLUE' })
    })

    it('bindings are re-invoked when a repo changes', function() {
      expect.assertions(1)

      let repo = new Repo()
      let model = new Model(repo)

      model.bind({
        upper: state => state.style.color.toUpperCase()
      })

      model.on('change', function({ upper }) {
        expect(upper).toEqual('RED')
      })

      repo.patch({ style: { color: 'red' } })
    })

    it('bindings invoke anything that implements call', function() {
      expect.assertions(1)

      let repo = new Repo()
      let model = new Model(repo)

      model.bind({
        upper: {
          call: (_scope, state) => state.style.color.toUpperCase()
        }
      })

      model.on('change', function({ upper }) {
        expect(upper).toEqual('RED')
      })

      repo.patch({ style: { color: 'red' } })
    })
  })

  describe('Observables', function() {
    it('binds to observables', function() {
      let repo = new Repo()
      let model = new Model(repo)

      jest.spyOn(model, 'set')

      model.bind({
        count: Observable.of(1, 2, 3)
      })

      expect(model.set).toHaveBeenCalledWith('count', 1)
      expect(model.set).toHaveBeenCalledWith('count', 2)
      expect(model.set).toHaveBeenCalledWith('count', 3)

      expect(model.set).toHaveBeenCalledTimes(3)
    })

    it('gets the current observable value', function() {
      let repo = new Repo()
      let model = new Model(repo)

      jest.spyOn(model, 'set')

      let delayed = new Observable(observer => {
        observer.next(1)
        setTimeout(() => observer.next(2))
      })

      model.bind({
        count: delayed
      })

      model.bind({
        count: delayed
      })

      expect(model.set).toHaveBeenCalledWith('count', 1)
      expect(model.set).not.toHaveBeenCalledWith('count', 2)
      expect(model.set).toHaveBeenCalledTimes(2)
    })

    it('gets observable values right away', function() {
      let repo = new Repo()
      let model = new Model(repo)

      jest.spyOn(model, 'set')

      let count = new Observable(observer => {
        observer.next(1)
        observer.complete()
      })

      model.bind({ count })

      expect(model.set).toHaveBeenCalledWith('count', 1)
    })

    it('updates when an observable changes', function() {
      let repo = new Repo()
      let model = new Model(repo)

      let hash = new Observable(observer => {
        function updater() {
          observer.next(window.location.hash)
        }

        updater()

        window.addEventListener('hashchange', updater)

        return () => window.removeEventListener('hashchange', updater)
      })

      model.bind({ hash })

      expect(model.value.hash).toEqual('')

      window.location.hash = 'foo=bar'
      window.dispatchEvent(new Event('hashchange'))

      expect(model.value.hash).toEqual('#foo=bar')
    })

    it('removes subscriptions on teardown', function() {
      let repo = new Repo()
      let model = new Model(repo)
      let updater = null

      let test = new Observable(observer => {
        updater = value => observer.next(value)
      })

      model.bind({ test })

      updater(2)
      expect(model.value.test).toEqual(2)

      model.teardown()

      updater(3)
      expect(model.value.test).toEqual(2)
    })
  })
})
