import Microcosm from '../../../src/microcosm'

describe('Domain actions', function() {
  describe('When a domain includes an actions object', () => {
    let repo = null
    let addPlanet = null

    beforeEach(function() {
      repo = new Microcosm()
      addPlanet = jest.fn(name => ({ name }))

      repo.addDomain('planets', {
        getInitialState() {
          return []
        },

        actions: { addPlanet },

        register: {
          addPlanet: (planets, params) => planets.concat(params)
        }
      })
    })

    it('correctly associates the string name to the action', function() {
      let action = repo.push('addPlanet', 'earth')

      expect(action.command).toEqual(addPlanet)
      expect(repo).toHaveState('planets', [{ name: 'earth' }])
    })

    it('correctly associates the original action', function() {
      let action = repo.push(addPlanet, 'earth')

      expect(action.command).toEqual(addPlanet)
      expect(repo).toHaveState('planets', [{ name: 'earth' }])
    })

    it.dev('raises if pushing an unsupported alias', function() {
      expect(repo.prepare('badAlias')).toThrow(
        'Unknown action type "badAlias".'
      )
    })
  })
})
