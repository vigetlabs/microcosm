import Microcosm from '../../../src/microcosm'

describe('Microcosm::release', function () {

  it('will not emit a change if state is shallowly equal', function () {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity] : (state, next) => next }
      }
    })

    repo.on('change', spy)

    repo.push(identity, 0)

    expect(spy).not.toHaveBeenCalled()
  })

  it('will emit a change if state is not shallowly equal', function () {
    const repo = new Microcosm()
    const identity = n => n
    const spy = jest.fn()

    repo.addDomain('test', {
      getInitialState() {
        return 0
      },
      register() {
        return { [identity] : (_, next) => next }
      }
    })

    repo.on('change', spy)

    repo.push(identity, 1)

    expect(spy).toHaveBeenCalledTimes(1)
  })

})
