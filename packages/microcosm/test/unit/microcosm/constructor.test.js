import Microcosm from 'microcosm'

describe.skip('Microcosm constructor', function() {
  describe('maxHistory option', function() {
    it('controls history size', function() {
      const repo = new Microcosm({ maxHistory: 5 })

      expect(repo.history).toHaveProperty('limit', 5)
    })
  })

  describe('extending options', function() {
    it('extends custom defaults with Microcosm defaults', function() {
      class Repo extends Microcosm {
        static defaults = {
          test: true
        }
      }

      let repo = new Repo()

      expect(repo.options).toHaveProperty('test', true)
      expect(repo.options).toHaveProperty('batch', false)
    })

    it('extends custom defaults with passed arguments', function() {
      class Repo extends Microcosm {
        static defaults = {
          test: true
        }
      }

      let repo = new Repo({ maxHistory: 10, instantiated: true })

      expect(repo.options).toHaveProperty('maxHistory', 10)
      expect(repo.options).toHaveProperty('test', true)
      expect(repo.options).toHaveProperty('instantiated', true)
    })
  })
})
