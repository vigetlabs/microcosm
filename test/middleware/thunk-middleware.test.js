import Action from '../../src/action'

test('returns a function that exposes the action', function () {
  const spy = jest.fn()
  const action = new Action(n => spy)

  action.execute()

  expect(spy).toHaveBeenCalledWith(action)
})
