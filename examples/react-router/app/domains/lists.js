// @flow
import { addList, removeList } from '../actions/lists'

type List = {
  id: string,
  name: string
}

class Lists {
  getInitialState() {
    return []
  }

  add(lists: List[], params: Object): List[] {
    return lists.concat({ name: 'Unspecified', ...params })
  }

  remove(lists: List[], unwanted: string) {
    return lists.filter(i => i.id !== unwanted)
  }

  register() {
    return {
      [addList.toString()]: this.add,
      [removeList.toString()]: this.remove
    }
  }
}

export default Lists
