import test from 'ava'
import Domain from '../src/domain'
import Microcosm from '../src/microcosm'

const create  = n => n
const destroy = n => n

import Immutable from 'immutable'

class TestDomain extends Domain {

  getInitialState() {
    return Immutable.Map()
  }

  shouldCommit(next, previous) {
    return Immutable.is(next, previous) === false
  }

  add(state, record) {
    return state.set(record.id, record)
  }

  remove(state, id) {
    return state.remove(id)
  }

  commit(state) {
    return Array.from(state.values())
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

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })

  t.is(repo.state.users[0].name, 'Bill')
})

test('removes records', t => {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })
  repo.push(destroy, 1)

  t.is(repo.state.users.length, 0)
})

test('does not generate a new array if no state changes', t => {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })
  repo.push(destroy, 1)
  var a = repo.state

  repo.push(destroy, 1)
  var b = repo.state

  t.is(a.users, b.users)
})
