import Microcosm from 'microcosm'

describe('Snapshots', function() {
  it('forks accommodate actions that were pushed before the parent was forked', function() {
    let parent = new Microcosm()

    let wait = n => new Promise(n => n)
    let action = parent.push(wait)

    parent.addDomain('top', {
      getInitialState() {
        return 0
      },
      add(count, n) {
        return count + n
      },
      register() {
        return {
          [wait]: this.add
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
          [wait]: this.add
        }
      }
    })

    expect(action.status).toBe('start')

    action.complete(2)

    expect(parent).toHaveState('top', 2)
    expect(child).toHaveState('bottom', 2)
  })
})
