import Collection from '../../../lib/collection'
import {removeList} from '../lists'
import {addItem, removeItem} from '../items'

const Items = Collection({
  name : 'Unspecified',
  list : null
})

Items.register = function () {
  return {
    [addItem]    : Items.add,
    [removeItem] : Items.remove,
    [removeList] : Items.removeBy('list')
  }
}

export default Items
