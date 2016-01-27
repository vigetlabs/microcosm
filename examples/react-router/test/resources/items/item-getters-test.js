import assert  from 'assert'
import getters from '../../../app/resources/items/getters'

describe('Item Getters', function() {
  const state = {
    lists: [{ id: 1 }, { id: 2 }],
    items: [{ id: 3, list: 1 }, {id: 4, list: 1 }]
  }

  it ('can get all lists out of a state object', function() {
    assert.equal(getters.all(state), state.items)
  })

  it ('can children of a specific list', function() {
    assert.deepEqual(getters.childrenOf(1)(state).map(i => i.id), [ 3, 4 ])
  })

})
