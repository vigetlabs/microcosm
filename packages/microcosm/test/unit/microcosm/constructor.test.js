import Microcosm from 'microcosm'

describe('Microcosm constructor', function() {
  describe('extending options', function() {
    it('extends custom defaults with Microcosm defaults', function() {
      class Repo extends Microcosm {
        static defaults = {
          test: true
        }
      }

      let repo = new Repo()

      expect(repo.options).toHaveProperty('test', true)
      expect(repo.options).toHaveProperty('debug', false)
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
