import Store from '../Store'

describe('Store', function() {

  it ('defaults to getInitialState within the deserialize method', function() {
    let store = Object.create(Store)

    store.getInitialState = sinon.mock()
    store.deserialize()

    store.getInitialState.should.have.been.called
  })

})
