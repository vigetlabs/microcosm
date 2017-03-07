import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action constructor', function () {

  it('an action payload is undefined by default', function () {
    const action = new Action('test').resolve()

    expect(action.payload).toBe(undefined)
  })

  it('an action can be set to a specific status', function () {
    let repo = new Microcosm()

    let action = repo.append('test', 'resolve')

    expect(action.is('resolve')).toBe(true)
  })

})
