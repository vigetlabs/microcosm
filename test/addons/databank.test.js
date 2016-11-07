import Microcosm from '../../src/microcosm'
import Databank from '../../src/addons/databank'

class Bank extends Databank {
  put (state, data) {
    if (Array.isArray(data)) {
      return data.map(item => this.put(state, item))
    }

    return ['put', data.id, data]
  }

  patch (state, data) {
    return ['patch', data.id, data]
  }

  destroy (state, id) {
    return ['destroy', id]
  }

  putMulti

  register () {
    return {
      put      : this.put,
      patch    : this.patch,
      destroy  : this.destroy
    }
  }
}

describe('put', function() {

  test('adds a record that does not exist', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)

    repo.push('put', { id: '1', name: 'Billy' })

    expect(repo.state.users.length).toEqual(1)
  })

})

describe('patch', function() {

  test('updates a record in place', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)

    repo.push('put', { id: '1', name: 'Billy' })
    repo.push('patch', { id: '1', name: 'Billy Booster' })

    expect(repo.state.users[0].name).toEqual('Billy Booster')
  })

  test('does not write new state if the values are the same', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)
    repo.push('put', { id: '1', name: 'Billy' })
    repo.push('patch', { id: '1', name: 'Billy Booster' })

    const last = repo.state

    repo.push('patch', { id: '1', name: 'Billy Booster' })


    const next = repo.state

    expect(last).toBe(next)
  })

})

describe('destroy', function () {

  test('removes a record', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)

    repo.push('put', { id: '1', name: 'Billy' })

    repo.push('destroy', '1')

    expect(repo.state.users.length).toEqual(0)
  })

  test('removes many records', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)

    repo.push('put', { id: '1', name: 'Billy' })
    repo.push('put', { id: '2', name: 'Billy' })
    repo.push('destroy', ['1', '2'])

    expect(repo.state.users.length).toEqual(0)
  })

})

describe('sequences', function () {

  test('it can perform a sequence of events', function () {
    let repo = new Microcosm()

    repo.addDomain('users', Bank)

    repo.push('put', [
      { id: '1', name: 'Billy' },
      { id: '2', name: 'Sally' },
      { id: '3', name: 'John' }
    ])

    expect(repo.state.users.map(i => i.name)).toEqual(['Billy', 'Sally', 'John'])
  })

})

describe('comparator', function () {

  test('can order by a given field', function () {
    let repo = new Microcosm()

    class NameBank extends Bank {
      comparator (a, b) {
        return a.name > b.name ? 1 : -1
      }
    }

    repo.addDomain('users', NameBank)

    repo.push('put', [
      { id: '1', name: 'Billy' },
      { id: '2', name: 'Sally' },
      { id: '3', name: 'John' }
    ])

    expect(repo.state.users.map(i => i.name)).toEqual(['Billy', 'John', 'Sally'])
  })

})

describe('transpose', function () {

  test('converts a list into a map', function () {
    let repo = new Microcosm()
    let items = [
      { id: '1', name: 'Billy' },
      { id: '2', name: 'Sally' },
      { id: '3', name: 'John' }
    ]

    class TransposedBank extends Bank {
      getInitialState() {
        return ['transpose', 'id', items]
      }
    }

    repo.addDomain('users', TransposedBank)

    expect(repo.state.users.map(i => i.name)).toEqual(['Billy', 'Sally', 'John'])
  })

})
