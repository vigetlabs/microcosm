import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

describe('Action callbacks', function () {
  it('handles listeners with no callback', function () {
    const action = new Action(n => n)

    action.onDone()
    action.onError()
    action.onCancel()
    action.onUpdate()
  })
})
