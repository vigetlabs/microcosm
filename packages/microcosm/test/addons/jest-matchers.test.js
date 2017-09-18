import { Microcosm } from 'microcosm'

describe('toRegister', function() {
  let action = n => n

  it('fails if given no register method', function() {
    expect(() => {
      expect({}).toRegister(action)
    }).toThrow(/Object has no register method/)
  })

  it('fails if a register object does not contain the action', function() {
    const entity = { register: {} }

    expect(() => {
      expect(entity).toRegister(action)
    }).toThrow(/Expected entity to register to the 'done' state of action/)
  })

  it('works in reverse', function() {
    expect({ register: {} }).not.toRegister(action)
  })
})

describe('toHaveStatus', function() {
  it('fails if given a non-action', function() {
    expect(() => {
      expect({}).toHaveStatus('done')
    }).toThrow(/toHaveStatus expects an action./)
  })

  it('fails when the status is wrong', function() {
    let repo = new Microcosm()
    let test = repo.append('test')

    expect(() => {
      expect(test).toHaveStatus('done')
    }).toThrow(/Expected action to be 'done'/)
  })
})

describe('toHaveState', function() {
  it('fails if given a non-microcosm', function() {
    expect(() => {
      expect({}).toHaveState('foo', 'bar')
    }).toThrow(/toHaveState expects a Microcosm./)
  })

  it('fails if given the state is not equal', function() {
    expect(() => {
      expect(new Microcosm()).toHaveState('foo', 'bar')
    }).toThrow(/Expected 'foo' in repo.state/)
  })
})
