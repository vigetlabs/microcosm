import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
import Query     from '../../lib/query'
import Show      from '../views/lists/show'

import { addItem, removeItem } from '../actions/items'

class ListShow extends Presenter {

  viewModel({ params }) {
    return {
      list  : Query.get('lists', params.id),
      items : Query.where('items', 'list', params.id)
    }
  }

  addItem(app, params) {
    return app.push(addItem, params)
  }

  removeItem(app, params) {
    return app.push(removeItem, params.id)
  }

  render() {
    return <Show list={ this.state.list } items={ this.state.items } />
  }

}

export default ListShow
