import test from 'ava'
import Store from '../src/store'
import Microcosm from '../src/microcosm'

const create  = n => n
const destroy = n => n

class TestDomain extends Store {

  getInitialState() {
    return ['reset']
  }

  set(state, [operation, path, params]) {
    switch (operation) {
      case 'reset':
        return {}
      case 'add':
        return { ...state, [path]: params }
      case 'remove':
        let next = {...state}
        delete next[path]
        return next
    }

    console.warn('Unexpected operation %s', operation)

    return state
  }

  add(state, record) {
    return ['add', record.id, record]
  }

  remove(state, id) {
    return ['remove', id]
  }

  register() {
    return {
      [create]  : this.add,
      [destroy] : this.remove
    }
  }
}

test('adds records', t => {
  var repo = new Microcosm()

  repo.addStore('users', TestDomain)

  repo.push(create, { id: 'bill', name: 'Bill' })

  t.is(repo.state.users.hasOwnProperty('bill'), true)
})

test('removes records', t => {
  var repo = new Microcosm()

  repo.addStore('users', TestDomain)

  repo.push(create, { id: 'bill', name: 'Bill' })
  repo.push(destroy, 'bill')

  t.is(repo.state.users.hasOwnProperty('bill'), false)
})
