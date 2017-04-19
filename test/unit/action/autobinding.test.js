import Action from '../../../src/action'

const identity = n => n

describe('Action autobinding', function () {
  let states = ['open', 'update', 'resolve', 'reject', 'cancel']

  states.forEach(function (state) {
    it(`${state} is autobound`, function () {
      const action = new Action(identity)

      function passByValue (callback) {
        callback(true)
      }

      passByValue(action[state])

      expect(action.status).toEqual(state)
      expect(action.payload).toEqual(true)
    })
  })
})
