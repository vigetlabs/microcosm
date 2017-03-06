import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action constructor', function () {

  it('an action payload is undefined by default', function () {
    const action = new Action('test').resolve()

    expect(action.payload).toBe(undefined)
  })

})
