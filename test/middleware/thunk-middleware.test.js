import test   from 'ava'
import Action from '../../src/action'

test('returns a function that exposes the action', t => {
  t.plan(1)

  const action = new Action(function () {
    return function (_action) {
      t.is(action, _action)
    }
  })

  action.execute()
})
