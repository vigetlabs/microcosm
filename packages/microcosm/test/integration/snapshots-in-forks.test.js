import Microcosm from 'microcosm'

describe('Snapshots', function() {
  it('forks accommodate actions that were pushed before the parent was forked', function() {
    let parent = new Microcosm()

    let action = parent.append('add', 'open')

    parent.addDomain('top', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        return count + n
      },
      register() {
        return {
          add: this.add
        }
      }
    })

    let child = parent.fork()

    child.addDomain('bottom', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        return count + n
      },
      register() {
        return {
          add: this.add
        }
      }
    })

    action.resolve(2)

    expect(parent).toHaveState('top', 2)
    expect(child).toHaveState('bottom', 2)
  })
})
