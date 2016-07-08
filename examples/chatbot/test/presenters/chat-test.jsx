import React from 'react'
import Microcosm from 'microcosm'
import Chat from '../../app/presenters/chat'
import assert from 'assert'
import { mount } from 'enzyme'

describe('Chat Presenter', function() {

  beforeEach(function() {
    this.app = new Microcosm()
    this.presenter = mount(<Chat app={ this.app } />).instance()
  })

  it ('feeds a chat message to the application', function (done) {
    this.app.push = function (action, message) {
      assert.equal(message, 'hello')
      done()
    }

    this.presenter.send('sendChat', { message: 'hello' })
  })

})
