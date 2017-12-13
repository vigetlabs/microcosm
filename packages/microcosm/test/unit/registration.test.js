import Microcosm, { STATUS } from 'microcosm'

const action = n => n

describe('getRegistration', function() {
  it('can use nested objects to return specific statuses', async () => {
    let handler = jest.fn()
    let action = () => Promise.reject('Reject')

    class Repo extends Microcosm {
      setup() {
        this.addDomain('test', {
          register() {
            return {
              [action]: {
                error: handler
              }
            }
          }
        })
      }
    }

    let repo = new Repo()

    await repo.push(action)

    expect(handler).toHaveBeenCalled()
  })

  it('can chain domain handlers', function() {
    let format = text => text

    let repo = new Microcosm()

    repo.addDomain('word', {
      register() {
        return {
          [format]: [
            (state, string) => string,
            string => string.slice(0, 4),
            string => string.toUpperCase()
          ]
        }
      }
    })

    repo.push(format, 'test-string')

    expect(repo).toHaveState('word', 'TEST')
  })

  it('can chain effect handlers', function() {
    let a = jest.fn()
    let b = jest.fn()

    let repo = new Microcosm()

    repo.addEffect({
      register() {
        return {
          test: [a, b]
        }
      }
    })

    repo.push('test', 'foobar')

    expect(a).toHaveBeenCalledWith(repo, 'foobar')
    expect(b).toHaveBeenCalledWith(repo, 'foobar')
  })

  it.skip(
    'prints the action name in the warning when a handler is undefined',
    function() {
      class Repo extends Microcosm {
        setup() {
          this.addDomain('test', {
            register: {
              getUser: undefined
            }
          })
        }
      }

      let repo = new Repo()

      expect(repo.prepare('getUser')).toThrow(
        'getUser key within a registration is undefined. Is it being referenced correctly?'
      )
    }
  )
})
