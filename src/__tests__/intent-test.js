import intent from '../intent'
import {Dispatcher} from 'flux'

describe('intent', function() {

  let Actions = {
    create(data) { return data }
  }

  it ('can dispatch actions', function(done) {
    let dispatcher = new Dispatcher()
    let actions    = intent(dispatcher)(Actions, 'pref')

    let spy = sinon.spy(dispatcher, 'dispatch')

    actions.create('data').then(function(body) {
      body.should.equal('data')
      spy.should.have.been.calledWith({ type: 'pref-create', body })
      done()
    })

  })

})
