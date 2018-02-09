import Microcosm, { merge, reset } from 'microcosm'

describe('rollbacks', function() {
  it('does not rollforward the same actions twice', function() {
    const repo = new Microcosm({ debug: true })
    const send = () => action => {}

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
          [send]: {
            next: this.addLoading,
            complete: this.add
          }
        }
      }
    })

    const a = repo.push(send)
    const b = repo.push(send)
    const c = repo.push(send)

    a.next({ id: 1 })
    b.next({ id: 2 })
    c.next({ id: 3 })

    a.next({ id: 2 })
    a.complete()
    b.next({ id: 2 })
    b.complete()
    c.next({ id: 3 })
    c.complete()

    expect(repo).not.toHaveState('messages.0.pending')
    expect(repo).not.toHaveState('messages.1.pending')
    expect(repo).not.toHaveState('messages.2.pending')

    expect(repo.state.messages).toHaveLength(3)
  })

  it('remembers the archive point', function() {
    const repo = new Microcosm({ debug: true })
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
          [send]: this.add
        }
      }
    })

    const a = repo.push(send, { id: 1 })
    const b = repo.push(send, { id: 2 })
    const c = repo.push(send, { id: 3 })

    repo.history.checkout(a)
    expect(repo.state.messages.map(m => m.id)).toEqual([1])

    repo.history.checkout(c)
    expect(repo.state.messages.map(m => m.id)).toEqual([1, 2, 3])

    repo.history.checkout(b)
    expect(repo.state.messages.map(m => m.id)).toEqual([1, 2])
  })

  it('properly rolls forward the cache', () => {
    const repo = new Microcosm()

    const all = () => action => {}
    const single = () => action => {}

    repo.addDomain('items', {
      getInitialState() {
        return []
      },

      reset(_, items) {
        return items
      },

      update(items, data) {
        return items.map(function(item) {
          if (item.id === data.id) {
            return { ...item, ...data }
          }
          return item
        })
      },

      setLoading(items, id) {
        return items.map(function(item) {
          if (item.id === id) {
            return { ...item, loading: true }
          }
          return item
        })
      },

      register() {
        return {
          [all]: this.reset,
          [single]: this.setLoading,
          [single]: this.update
        }
      }
    })

    const getAll = repo.push(all)
    const getOne = repo.push(single)
    const getTwo = repo.push(single)

    getAll.next([{ id: '1' }, { id: '2' }])
    getAll.complete()

    getOne.next('1')
    getTwo.next('2')

    getOne.next({ id: '1', done: true })
    getOne.complete()

    getTwo.next({ id: '2', done: true })
    getTwo.complete()

    expect(repo.state.items).toEqual([
      { id: '1', done: true },
      { id: '2', done: true }
    ])
  })

  it('processes multiple loading states', () => {
    const repo = new Microcosm()

    const all = n => n
    const single = () => action => {}

    repo.addDomain('items', {
      getInitialState() {
        return []
      },

      reset(_, items) {
        return items
      },

      update(items, data) {
        return items.map(function(item) {
          if (item.id === data.id) {
            return { ...item, ...data }
          }
          return item
        })
      },

      setLoading(items, id) {
        return items.map(function(item) {
          if (item.id === id) {
            return { ...item, loading: true }
          }
          return item
        })
      },

      register() {
        return {
          [all]: this.reset,
          [single]: {
            next: this.setLoading,
            complete: this.update
          }
        }
      }
    })

    repo.push(all, [{ id: '1' }, { id: '2' }, { id: '3' }])

    repo.push(single).next('1')
    repo.push(single).next('2')
    repo.push(single).next('3')

    expect(repo.state.items.map(i => i.loading)).toEqual([true, true, true])
  })

  it('handles cancelling back to a former state', () => {
    const repo = new Microcosm()

    const foldIn = () => action => {}

    repo.addDomain('styles', {
      getInitialState() {
        return { color: 'blue' }
      },

      merge(state, rules) {
        return merge(state, rules)
      },

      register() {
        return {
          [foldIn]: {
            next: this.merge,
            complete: this.merge
          }
        }
      }
    })

    let action = repo.push(foldIn)

    action.next({ color: 'red' })

    expect(repo).toHaveState('styles.color', 'red')

    action.cancel()

    expect(repo).toHaveState('styles.color', 'blue')
  })

  it('can checkout the root', () => {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return true
      }
    })

    repo.push(() => action => {})

    repo.history.checkout(repo.history.root)

    expect(repo).toHaveState('test', true)
  })

  it('can checkout the root after a reconciliation', () => {
    const repo = new Microcosm({ debug: true })

    repo.addDomain('test', {
      getInitialState() {
        return true
      }
    })

    repo.push(reset, { test: false })

    repo.history.checkout(repo.history.root)

    expect(repo).toHaveState('test', false)
  })
})
