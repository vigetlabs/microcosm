import Microcosm from '../src/microcosm'

const create  = n => n
const destroy = n => n

import Immutable from 'immutable'

class TestDomain {

  getInitialState () {
    return Immutable.Map()
  }

  shouldCommit (next, previous) {
    return Immutable.is(next, previous) === false
  }

  add (state, record) {
    return state.set(record.id, record)
  }

  remove (state, id) {
    return state.remove(id)
  }

  commit (state) {
    return Array.from(state.values())
  }

  register () {
    return {
      [create]  : this.add,
      [destroy] : this.remove
    }
  }
}

it('adds records', function () {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })

  expect(repo.state.users[0].name).toEqual('Bill')
})

it('removes records', function () {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })
  repo.push(destroy, 1)

  expect(repo.state.users.length).toEqual(0)
})

it('staged does not get modified', function () {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  expect(repo.staged.users instanceof Immutable.Map).toBe(true)
})

it('does not generate a new array if no state changes', function () {
  var repo = new Microcosm()

  repo.addDomain('users', TestDomain)

  repo.push(create, { id: 1, name: 'Bill' })
  repo.push(destroy, 1)
  var a = repo.state

  repo.push(destroy, 1)
  var b = repo.state

  expect(a.users).toBe(b.users)
})
