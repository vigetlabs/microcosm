import React     from 'react'
import Presenter from '../../../../src/addons/presenter'
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

  register() {
    return {
      addList    : this.addList,
      removeList : this.removeList
    }
  }

  addList(repo, params) {
    return repo.push(addList, params)
  }

  removeList(repo, params) {
    return repo.push(removeList, params.id)
  }

  render() {
    return <Index lists={ this.state.lists } counts={ this.state.counts } />
  }

}

export default ListIndex
