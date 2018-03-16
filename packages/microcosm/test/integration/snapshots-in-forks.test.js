import Microcosm from 'microcosm'

describe('Snapshots', function() {
  it('forks accommodate actions that were pushed before the parent was forked', function() {
    let parent = new Microcosm()

    let wait = n => action => {}

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

    let action = parent.push(wait)

    expect(action.meta.status).toBe('start')

    action.next(2)
    action.complete()

    expect(parent).toHaveState('top', 2)
    expect(child).toHaveState('bottom', 2)
  })
})
