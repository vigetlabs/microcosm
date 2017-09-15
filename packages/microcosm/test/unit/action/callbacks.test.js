import Microcosm from 'microcosm'

const states = ['open', 'update', 'resolve', 'reject', 'cancel']

describe('Action callbacks', function() {
  it('handles listeners with no callback', function() {
    const repo = new Microcosm()
    const action = repo.append(n => n)

    action.onDone()
    action.onError()
    action.onCancel()
    action.onUpdate()
  })

  states.forEach(function(state) {
    it(`${state} is autobound`, function() {
      const repo = new Microcosm()
      const action = repo.append(n => n)

      function passByValue(callback) {
        callback(true)
      }

      passByValue(action[state])

      expect(action.status).toEqual(state)
      expect(action.payload).toEqual(true)
    })
  })
})
