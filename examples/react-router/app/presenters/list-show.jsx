import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Query     from '../../lib/query'
import Show      from '../views/lists/show'

import { addItem, removeItem } from '../actions/items'

class ListShow extends Presenter {
  register() {
    return {
      addItem    : this.addItem,
      removeItem : this.removeItem
    }
  }

  addItem(repo, params) {
    return repo.push(addItem, params)
  }

  removeItem(repo, params) {
    return repo.push(removeItem, params.id)
  }

  model ({ params }) {
    return {
      list  : Query.get('lists', params.id),
      items : Query.where('items', 'list', params.id)
    }
  }

  view ({ list, items }) {
    return <Show list={list} items={items} />
  }
}

export default ListShow
