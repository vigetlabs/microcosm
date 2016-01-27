import Collection from '../../../lib/collection'
import {addList, removeList} from '../lists/actions'

const Lists = Collection({
  name : 'Unspecified'
})

Lists.register = function () {
  return {
    [addList]    : Lists.add,
    [removeList] : Lists.remove
  }
}

export default Lists
