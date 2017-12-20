import Microcosm, { Subject } from 'microcosm'

describe('History::remove', function() {
  it('resets when there are no actions left', function() {
    let repo = new Microcosm({ debug: true })

    let action = repo.push('action')

    expect(repo.history.size).toBe(1)
    repo.history.remove(action)
    expect(repo.history.size).toEqual(0)
  })

  it('does not remove the root when given a node outside the tree', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('test')
    repo.history.remove(new Subject('external'))

    expect(repo.history.size).toEqual(1)
  })

  describe('reconciliation', function() {
    it('does not call reconciliation when removing a disabled child', function() {
      let repo = new Microcosm({ debug: true })
      repo.push('one')
      let action = repo.push('two')
      let handler = jest.fn()

      repo.history.toggle(action)
      repo.history.updates.subscribe(handler)
      repo.history.remove(action)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('removing the head', function() {
    it('adjusts the head to the prior node', function() {
      let repo = new Microcosm({ debug: true })
      let one = repo.push('one')
      let two = repo.push('two')

      repo.history.remove(two)

      expect(repo.history.head).toBe(one)
    })

    it('removes the node from the active branch', function() {
      let repo = new Microcosm({ debug: true })

      repo.push('one')
      repo.push('two')
      let three = repo.push('three')

      repo.history.remove(three)

      expect(Array.from(repo.history).map(i => i.tag)).toEqual(['one', 'two'])
    })

    it('removing the head node eliminates the reference to "next"', function() {
      let repo = new Microcosm({ debug: true })

      let one = repo.push('one')
      let two = repo.push('two')
      let three = repo.push('three')

      repo.history.remove(three)

      expect(repo.history.after(one)).toBe(two)
      expect(repo.history.after(two)).toBe(undefined)
      expect(repo.history.after(three)).toBe(undefined)
    })
  })

  describe('removing the root', function() {
    it('adjusts the root to the next node', function() {
      let repo = new Microcosm({ debug: true })

      repo.push('one')
      repo.push('two')
      repo.push('three')

      let root = repo.history.root
      let next = repo.history.after(root)

      repo.history.remove(root)

      expect(repo.history.root).toBe(next)
    })

    it('updates the active branch', function() {
      let repo = new Microcosm({ debug: true })
      let history = repo.history

      repo.push('one')
      repo.push('two')
      repo.push('three')

      history.remove(history.root)

      expect(Array.from(history).toString()).toEqual('two,three')
    })
  })

  describe('removing an intermediary node', function() {
    it('joins the parent and child', function() {
      let repo = new Microcosm({ debug: true })

      repo.push('one')
      let two = repo.push('two')
      repo.push('three')

      repo.history.remove(two)

      expect(Array.from(repo.history).toString()).toEqual('one,three')
    })

    it('will not "jump" to the nearest action if the head is removed', function() {
      let repo = new Microcosm({ debug: true })

      repo.push('one')
      let two = repo.push('two')
      repo.push('three')

      repo.history.checkout(two)
      repo.history.remove(two)

      expect(Array.from(repo.history).toString()).toEqual('one')
    })

    it('reconciles at the next action', function() {
      let repo = new Microcosm({ debug: true })
      let next = jest.fn()

      repo.push('one')
      let two = repo.push('two')
      let three = repo.push('three')

      repo.history.updates.subscribe(next)
      repo.history.remove(two)

      expect(next).toHaveBeenCalledWith(three)
    })

    it('reconciles at the parent if the action is head of an active branch', function() {
      let repo = new Microcosm({ debug: true })
      let next = jest.fn()

      repo.push('one')

      let two = repo.push('two')
      let three = repo.push('three')

      repo.history.checkout(two)

      repo.history.updates.subscribe(next)
      repo.history.remove(two)

      expect(next).toHaveBeenCalledWith(three)
    })

    // TODO: We don't track the active branch when removing
    it.skip('does not reconcile if the action is not in active branch', function() {
      let repo = new Microcosm({ debug: true })
      let next = jest.fn()

      repo.push('one')
      let two = repo.push('two')
      let three = repo.push('three')

      repo.history.checkout(two)

      repo.history.updates.subscribe(next)

      repo.history.remove(three)

      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('removing an unfocused branch terminator', function() {
    it('leaves the head reference alone', function() {
      let repo = new Microcosm({ debug: true })
      let one = repo.push('one')
      let two = repo.push('two')

      repo.history.checkout(one)
      repo.push('three')

      // History tree now looks like this:
      //                |- [two]
      // [root] - [one] +
      //                |- [*three]

      expect(Array.from(repo.history).toString()).toBe('one,three')
      repo.history.remove(two)
      expect(Array.from(repo.history).toString()).toBe('one,three')
    })
  })

  describe('children', function() {
    it('eliminates references to removed on the left', function() {
      let repo = new Microcosm({ debug: true })
      let history = repo.history

      let one = repo.push('one')
      let two = repo.push('two')

      repo.history.checkout(one)

      let three = repo.push('three')

      history.remove(two)

      expect(history.children(one)).not.toContain(two)
      expect(history.children(one)).toContain(three)
    })

    it('maintains children on the left when the next action is removed', function() {
      let repo = new Microcosm({ debug: true })
      let history = repo.history

      let one = repo.push('one')
      let two = repo.push('two')

      repo.history.checkout(one)

      let three = repo.push('three')

      history.remove(three)

      expect(history.children(one)).toEqual([two])
    })

    it('allows having children, but no next value', function() {
      let repo = new Microcosm({ debug: true })
      let one = repo.push('one')
      let two = repo.push('two')

      repo.history.checkout(one)

      let three = repo.push('three')

      repo.history.remove(three)

      expect(repo.history.head).toEqual(one)
      expect(repo.history.children(one)).toEqual([two])
    })
  })
})
