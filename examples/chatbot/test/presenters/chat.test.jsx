import test from 'ava'
import React from 'react'
import Microcosm from '../../../../src/microcosm'
import Chat from '../../app/presenters/chat'
import { mount } from 'enzyme'

test.cb('feeds a chat message to the application', t => {
  const repo = new Microcosm()
  const presenter = mount(<Chat repo={ repo } />).instance()

  repo.push = function (action, message) {
    t.is(message, 'hello')
    t.end()
  }

  presenter.send('sendChat', { message: 'hello' })
})
