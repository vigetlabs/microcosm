import promiseWrap from '../promiseWrap'

describe('promiseWrap', function() {

  it ('should convert a plain value into a Promise', function() {
    let value = 'value'

    promiseWrap(value).should.be.instanceof(Promise)
  })

  it ('should not convert a Promise', function() {
    let value = Promise.resolve('value')

    promiseWrap(value).should.equal(value)
  })

})
