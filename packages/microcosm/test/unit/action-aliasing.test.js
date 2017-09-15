import Microcosm from 'microcosm'

describe('When a domain includes an actions object', () => {
  let repo = null
  let addPlanet = null

  beforeEach(function() {
    repo = new Microcosm()
    addPlanet = jest.fn(name => ({ name }))

    repo.addDomain('planets', {
      actions: { addPlanet },
      getInitialState() {
        return []
      },
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
})

describe('When an effect includes an actions object', () => {
  let repo = null
  let addPlanet = null

  beforeEach(function() {
    repo = new Microcosm()
    addPlanet = jest.fn(name => ({ name }))
  })

  it('correctly associates the string name to the action', function() {
    let handler = jest.fn()

    repo.addEffect({
      actions: { addPlanet },
      register: {
        addPlanet: handler
      }
    })

    let action = repo.push('addPlanet', 'earth')

    expect(action.command).toEqual(addPlanet)
    expect(handler).toHaveBeenCalledWith(repo, { name: 'earth' })
  })
})
