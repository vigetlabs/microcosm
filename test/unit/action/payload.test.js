import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

describe('action.payload', function () {

  it('an action can intentionally be set to undefined', function () {
    const action = new Action('test')

    action.open(true)
    action.resolve(undefined)

    expect(action.payload).toBe(undefined)
  })

})
