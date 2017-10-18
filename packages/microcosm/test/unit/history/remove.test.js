import Microcosm from 'microcosm'

describe('History::remove', function() {
  it('resets when there are no actions left', function() {
    let repo = new Microcosm({ maxHistory: Infinity })
    let history = repo.history

    let root = history.root

    expect(history.size).toBe(1)

    history.remove(history.root)

    expect(history.root).not.toEqual(root)

    expect(history.size).toEqual(1)
  })

  it('does not remove the root when given a node outside the tree', function() {
    let repo = new Microcosm()
    let history = repo.history
    let action = repo.append('test')

    history.remove(action)

    jest.spyOn(history, 'clean')

    history.remove(action)

    expect(history.clean).not.toHaveBeenCalled()
  })

  describe('reconciliation', function() {
    it('does not call reconciliation when removing a disabled child', function() {
      let repo = new Microcosm()
      let history = repo.history

      repo.append('one')

      let action = repo.append('two')

      action.toggle()

      jest.spyOn(history, 'reconcile')

      history.remove(action)

      expect(history.reconcile).not.toHaveBeenCalled()
    })
  })

  describe('removing the head', function() {
    it('adjusts the head to the prior node', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      repo.append('two', 'resolve')
      repo.append('three', 'resolve')

      let head = history.head
      let prior = head.parent

      history.remove(head)

      expect(history.head.id).toBe(prior.id)
    })

    it('removes the node from the active branch', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      repo.append('two', 'resolve')
      let three = repo.append(function three() {}, 'resolve')

      history.remove(three)

      expect(history.toString()).toEqual('one, two')
    })

    it('removing the head node eliminates the reference to "next"', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append(function one() {}, 'resolve')
      repo.append(function two() {}, 'resolve')
      let three = repo.append(function three() {}, 'resolve')

      history.remove(three)

      expect(history.head.next).toBe(null)
    })
  })

  describe('removing the root', function() {
    it('adjusts the root to the next node', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append(function one() {}, 'resolve')
      repo.append(function two() {}, 'resolve')
      repo.append(function three() {}, 'resolve')

      let root = history.root

      history.remove(root)

      expect(history.root.id).toBe(one.id)
    })

    it('updates the active branch', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      repo.append('two', 'resolve')
      repo.append('three', 'resolve')

      history.remove(history.root)

      expect(history.toString()).toEqual('one, two, three')
    })
  })

  describe('removing an intermediary node', function() {
    it('joins the parent and child', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')
      repo.append('three', 'resolve')

      history.remove(two)

      expect(history.toString()).toEqual('one, three')
    })

    it('resets the head if removing the head', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')
      repo.append('three', 'resolve')

      repo.checkout(two)
      history.remove(two)

      expect(history.toString()).toEqual('one')
    })

    it('reconciles at the next action', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')
      let three = repo.append('three', 'resolve')

      jest.spyOn(history, 'reconcile')

      history.remove(two)

      expect(history.reconcile).toHaveBeenCalledWith(three)
    })

    it('reconciles at the parent if the action is head of an active branch', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')

      repo.append('three', 'resolve')
      repo.checkout(two)

      jest.spyOn(history, 'reconcile')

      history.remove(two)

      expect(history.reconcile).toHaveBeenCalledWith(one)
    })

    it('does not reconcile if the action is not in active branch', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')
      let three = repo.append('three', 'resolve')

      repo.checkout(two)

      jest.spyOn(history, 'reconcile')

      history.remove(three)

      expect(history.reconcile).not.toHaveBeenCalled()
    })
  })

  describe('removing an unfocused branch terminator', function() {
    it('leaves the head reference alone', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')

      repo.checkout(one)
      repo.append('three', 'resolve')

      // History tree now looks like this:
      //                |- [two]
      // [root] - [one] +
      //                |- [*three]

      history.remove(two)

      expect(history.toString()).toBe('one, three')
    })
  })

  describe('children', function() {
    it('eliminates references to removed on the left', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')

      repo.checkout(one)

      let three = repo.append('three', 'resolve')

      history.remove(two)

      expect(one.children).not.toContain(two)
      expect(one.children).toContain(three)
    })

    it('maintains children on the left when the next action is removed', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append('one', 'resolve')
      let two = repo.append('two', 'resolve')

      repo.checkout(one)

      let three = repo.append('three', 'resolve')

      history.remove(three)

      expect(one.children).toEqual([two])
    })

    it('allows having children, but no next value', function() {
      let repo = new Microcosm({ maxHistory: Infinity })
      let history = repo.history

      let one = repo.append('one', 'resolve')

      repo.append('two', 'resolve')

      repo.checkout(one)

      let three = repo.append('three', 'resolve')

      history.remove(three)

      expect(history.head).toEqual(one)
      expect(history.head.next).toEqual(null)
    })
  })
})
