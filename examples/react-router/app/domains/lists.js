import Databank from '../../../../src/addons/databank'
import { addList, removeList } from '../actions/lists'

class Lists extends Databank {

  add (lists, params) {
    return ['put', params.id, params]
  }

  remove (lists, unwanted) {
    return ['destroy', unwanted]
  }

  register() {
    return {
      [addList]    : Lists.add,
      [removeList] : Lists.remove
    }
  }

}

export default Lists
