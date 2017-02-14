import Microcosm from '../src/microcosm'
import lifecycle from '../src/lifecycle'

let action = a => a

test('sends actions in the context of the domain', function () {
  expect.assertions(1)

  let repo = new Microcosm()

  repo.addDomain('test', {
    test: true,

    register() {
      return {
        [action]() {
          expect(this.test).toBe(true)
        }
      }
    }
  })

  repo.push(action)
})

test('returns the same state if a handler is not provided', function () {
  let repo = new Microcosm()

  repo.addDomain('test', {
    getInitialState() {
      return 'test'
    }
  })

  return repo.push(action).onDone(function() {
    expect(repo.state.test).toEqual('test')
  })
})

describe('nesting', function () {

  test('allows domains nested registration methods', function () {
    let repo = new Microcosm()
    let handler = jest.fn()

    let domain = repo.addDomain('test', {
      register () {
        return {
          [action]: {
            open    : handler,
            update  : handler,
            reject  : handler,
            resolve : handler,
            cancel  : handler
          }
        }
      }
    })

    expect(domain).toRegister(action, 'open')
    expect(domain).toRegister(action, 'update')
    expect(domain).toRegister(action, 'reject')
    expect(domain).toRegister(action, 'resolve')
    expect(domain).toRegister(action, 'cancel')
  })

  test('allows domains nested registration methods', function () {
    let repo = new Microcosm()
    let handler = jest.fn()

    let effect = repo.addEffect({
      register () {
        return {
          [action]: {
            open    : handler,
            update  : handler,
            reject  : handler,
            resolve : handler,
            cancel  : handler
          }
        }
      }
    })

    expect(effect).toRegister(action, 'open')
    expect(effect).toRegister(action, 'update')
    expect(effect).toRegister(action, 'reject')
    expect(effect).toRegister(action, 'resolve')
    expect(effect).toRegister(action, 'cancel')
  })

})
