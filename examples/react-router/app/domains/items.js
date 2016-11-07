import Databank from '../../../../src/addons/databank'
import { addItem, removeItem, } from '../actions/items'
import { removeList } from '../actions/lists'

class Items extends Databank {

  add (items, params) {
    return ['put', params.id, params]
  }

  remove (item, unwanted) {
    return ['destroy', unwanted]
  }

  removeByList(items, list) {
    let unwanted = items.filter(i => i.list !== list).map(i => i.id)

    return ['destroy', unwanted]
  }

  register () {
    return {
      [addItem]    : Items.add,
      [removeItem] : Items.remove,
      [removeList] : Items.removeByList
    }
  }

}

export default Items
