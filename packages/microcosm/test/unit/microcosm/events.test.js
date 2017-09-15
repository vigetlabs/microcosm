import Microcosm from 'microcosm'

describe('Microcosm events', function() {
  describe('::on', function() {
    it('can add a fine grained event subscription', function() {
      let repo = new Microcosm()
      let handler = jest.fn()

      repo.addDomain('styles', {
        getInitialState() {
          return { text: { color: 'blue' } }
        }
      })

      repo.on('change:styles.text.color', handler)

      repo.patch({ styles: { text: { color: 'red' } } })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith('red')
    })

    it('can subscribe to teardown', function() {
      let repo = new Microcosm()
      let handler = jest.fn()

      repo.on('teardown', handler)

      repo.shutdown()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(repo)
    })
  })

  describe('off', function() {
    it('can remove a fine grained event subscription', function() {
      let repo = new Microcosm()
      let handler = jest.fn()

      repo.addDomain('styles', {
        getInitialState() {
          return { text: { color: 'blue' } }
        }
      })

      repo.on('change:styles.text.color', handler)
      repo.off('change:styles.text.color', handler)

      repo.patch({ styles: { text: { color: 'red' } } })

      expect(handler).toHaveBeenCalledTimes(0)
    })

    it('can unsubscribe from teardown', function() {
      let repo = new Microcosm()
      let handler = jest.fn()

      repo.on('teardown', handler)
      repo.off('teardown', handler)

      repo.shutdown()

      expect(handler).toHaveBeenCalledTimes(0)
    })
  })
})
