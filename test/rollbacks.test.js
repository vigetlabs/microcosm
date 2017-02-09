import Microcosm, { merge } from '../src/microcosm'

test('does not rollforward the same actions twice', function () {
  const repo = new Microcosm({ maxHistory: Infinity })
  const send = n => n

  const a = repo.append(send)
  const b = repo.append(send)
  const c = repo.append(send)

  repo.addDomain('messages', {
    getInitialState() {
      return []
    },

    add(state, items) {
      return state.concat(items)
    },

    addLoading(state, params) {
      return this.add(state, { ...params, pending: true })
    },

    register() {
      return {
        [send.open] : this.addLoading,
        [send.done] : this.add
      }
    }
  })

  a.open({ id: 1 })
  b.open({ id: 2 })
  c.open({ id: 3 })
  a.resolve({ id: 2 })
  b.resolve({ id: 2 })
  c.resolve({ id: 3 })

  expect(repo.state.messages[0].pending).not.toBeDefined()
  expect(repo.state.messages[1].pending).not.toBeDefined()
  expect(repo.state.messages[2].pending).not.toBeDefined()

  expect(repo.state.messages.length).toEqual(3)
})

test('remembers the archive point', function () {
  const repo = new Microcosm({ maxHistory: Infinity })
  const send = n => n

  repo.addDomain('messages', {
    getInitialState() {
      return []
    },
    add(state, items) {
      return state.concat(items)
    },
    register() {
      return {
        [send.done] : this.add
      }
    }
  })

  const a = repo.push(send, { id: 1 })
  const b = repo.push(send, { id: 2 })
  const c = repo.push(send, { id: 3 })

  repo.checkout(a)
  expect(repo.state.messages.map(m => m.id)).toEqual([1])

  repo.checkout(c)
  expect(repo.state.messages.map(m => m.id)).toEqual([1, 2, 3])

  repo.checkout(b)
  expect(repo.state.messages.map(m => m.id)).toEqual([1, 2])
})

test('properly rolls forward the cache', () => {
  const repo = new Microcosm({ maxHistory: 0 })

  const all = n => n
  const single = n => n

  repo.addDomain('items', {
    getInitialState() {
      return []
    },

    reset(_, items) {
      return items
    },

    update (items, data) {
      return items.map(function (item) {
        if (item.id === data.id) {
          return { ...item, ...data }
        }
        return item
      })
    },

    setLoading (items, id) {
      return items.map(function (item) {
        if (item.id === id) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    register () {
      return {
        [all.done] : this.reset,
        [single.open] : this.setLoading,
        [single.done] : this.update
      }
    }
  })

  const getAll = repo.append(all)
  const getOne = repo.append(single)
  const getTwo = repo.append(single)

  getAll.resolve([{ id: '1' }, { id: '2' }])

  getOne.open('1')
  getTwo.open('2')

  getOne.resolve({ id: '1', done: true })
  getTwo.resolve({ id: '2', done: true })

  expect(repo.state.items.map(i => i.done)).toEqual([true, true])
})

test('processes multiple loading states', () => {
  const repo = new Microcosm()

  const all = n => n
  const single = n => n

  repo.addDomain('items', {
    getInitialState() {
      return []
    },

    reset(_, items) {
      return items
    },

    update (items, data) {
      return items.map(function (item) {
        if (item.id === data.id) {
          return { ...item, ...data }
        }
        return item
      })
    },

    setLoading (items, id) {
      return items.map(function (item) {
        if (item.id === id) {
          return { ...item, loading: true }
        }
        return item
      })
    },

    register () {
      return {
        [all.done] : this.reset,
        [single.open] : this.setLoading,
        [single.done] : this.update
      }
    }
  })

  repo.push(all, [{ id: '1' }, { id: '2' }, { id: '3' }])

  repo.append(single).open('1')
  repo.append(single).open('2')
  repo.append(single).open('3')

  expect(repo.state.items.map(i => i.loading)).toEqual([true, true, true])
})

test('handles cancelling back to a former state', () => {
  const repo = new Microcosm()

  const foldIn = n => n

  repo.addDomain('styles', {
    getInitialState() {
      return { color: 'blue' }
    },

    merge (state, rules) {
      return merge(state, rules)
    },

    register () {
      return {
        [foldIn.open] : this.merge,
        [foldIn.done] : this.merge
      }
    }
  })

  let action = repo.append(foldIn)

  action.open({ color: 'red' })

  expect(repo.state.styles.color).toEqual('red')

  action.cancel()

  expect(repo.state.styles.color).toEqual('blue')
})
