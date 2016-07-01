import React     from 'react'
import Presenter from 'microcosm/addons/presenter'
import Query     from '../../lib/query'
import Index     from '../views/lists/index'

import { addList, removeList } from '../actions/lists'

class ListIndex extends Presenter {

  viewModel() {
    return {
      lists  : Query.all('lists'),
      counts : Query.count('lists', 'items', 'list')
    }
  }

  addList(app, params) {
    return app.push(addList, params)
  }

  removeList(app, params) {
    return app.push(removeList, params.id)
  }

  render() {
    return <Index lists={ this.state.lists } counts={ this.state.counts } />
  }

}

export default ListIndex
