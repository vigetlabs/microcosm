import Items from '../../app/stores/items'
import assert from 'assert'

describe('Items Store', function() {

  it ('sets its default state to an empty array', function() {
    assert.deepEqual(Items.getInitialState(), [])
  })

  it ('appends an item', function () {
    let next = Items.add([], { id: 0 })
    assert.equal(next.length, 1)
  })

  it ('removes an item', function() {
    let next = Items.remove([{ id: 0 }], 0)
    assert.equal(next.length, 0)
  })

  it ('removes all children of a list', function() {
    let unwanted = 1
    let items = [{ id: 0, list: 1 }, { id: 1, list: 0 }]
    let next = Items.removeListItems(items, unwanted)

    assert.equal(next.length, 1)
    next.forEach(item => assert.notEqual(item.list, unwanted))
  })

})
