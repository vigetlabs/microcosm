import Microcosm from '../../../src/microcosm'

let append = (item, delay) => new Promise((resolve) => {
  setTimeout(() => resolve(item), delay)
})

describe('Microcosm::parallel', function() {
  it('runs actions in parallel', async function() {
    let repo = new Microcosm()
    let resolveOrder = []

    repo.addDomain('list', {
      getInitialState() {
        return []
      },
      register() {
        return {
          [append]: (list, item) => {
            resolveOrder.push(item)
            return list.concat(item)
          }
        }
      }
    })

    repo.parallel([
      repo.push(append, "late",  50),
      repo.push(append, "early", 10)
    ])

    await repo.history.wait()
    expect(repo).toHaveState('list', ['late', 'early'])

    expect(resolveOrder.slice(0, 2)).toEqual(['early', 'late'])
  })
})

describe('Microcosm::sequence', function() {
  it('runs actions in sequence', async function() {
    let repo = new Microcosm()
    let resolveOrder = []

    repo.addDomain('list', {
      getInitialState() {
        return []
      },
      register() {
        return {
          [append]: (list, item) => {
            resolveOrder.push(item)
            return list.concat(item)
          }
        }
      }
    })

    repo.sequence([
      repo.prepare(append, "late",  50),
      repo.prepare(append, "early", 10)
    ])

    await repo.history.wait()
    expect(repo).toHaveState('list', ['late', 'early'])

    expect(resolveOrder.slice(0, 2)).toEqual(['late', 'early'])
  })

  it('passes return value from previous action to next', async function() {
    let repo = new Microcosm()
    let add = (number, previous = 0) => number + previous

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return {
          [add]: (count, value) => count + value
        }
      }
    })

    repo.sequence([
      repo.prepare(add, 1),
      repo.prepare(add, 2)
    ])

    await repo.history.wait()

    // add(1) => 1
    // the return value of add(1) is then passed in as an
    // additional argument to the next action
    // add(2, 1) => 3
    expect(repo).toHaveState('count', 4)
  })
})
