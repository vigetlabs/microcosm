import assert  from 'assert'
import getters from '../../../app/resources/lists/getters'

describe('List Getters', function() {
  const state = {
    lists: [{ id: 1 }, { id: 2 }],
    items: [{ id: 3, list: 1 }, {id: 4, list: 1 }]
  }

  it ('can get all lists out of a state object', function() {
    assert.equal(getters.all(state), state.lists)
  })

  it ('can get a specific lists out of a state object', function() {
    assert.equal(getters.get(1)(state), state.lists[0])
  })

  it ('can counts of the children for all lists', function() {
    assert.deepEqual(getters.count(state), { 1: 2, 2: 0 })
  })

})
