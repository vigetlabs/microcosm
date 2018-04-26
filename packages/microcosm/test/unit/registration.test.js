import Microcosm from 'microcosm'

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
    try {
      await repo.push(action)
    } catch (x) {
      expect(x).toBe('Reject')
    }

    expect(handler).toHaveBeenCalled()
  })

  it('can chain domain handlers', async () => {
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

    await repo.push(format, 'test-string')

    expect(repo).toHaveState('word', 'TEST')
  })

  it('can chain effect handlers', async () => {
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

    await repo.push('test', 'foobar')

    expect(a).toHaveBeenCalledWith(repo, 'foobar')
    expect(b).toHaveBeenCalledWith(repo, 'foobar')
  })
})
