import remap from '../remap'

describe('remap', function() {

  it ('sets the initial state to a default object', function() {
    let answer = remap({ a: 1 }, value => value + 1)

    answer.a.should.equal(2)
  })

  it ('can seed from an existing object', function() {
    let answer = remap({ a: 1 }, value => value + 1, { b: 2 })

    answer.a.should.equal(2)
    answer.b.should.equal(2)
  })

})
