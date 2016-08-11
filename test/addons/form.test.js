import test from 'ava'
import React from 'react'
import Form from '../../src/addons/form'
import Action from '../../src/action'
import {mount} from 'enzyme'

test('executes onSuccess when that action completes', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onSuccess={ () => t.pass() } />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.close()
})

test('executes onFailure when that action completes', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onFailure={ () => t.pass() } />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.reject()
})

test('executes onLoading when that action sends an update', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onLoading={ () => t.pass() } />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.send()
})

const shouldNotCall = function (t, event, expected) {
  const element = React.createElement(Form, {
    intent: 'test',
    [event]: () => t.fail()
  })

  mount(element, {
    context: {
      send: () => true
    }
  }).simulate('submit')
}

test('does not execute onSuccess if not given an action', shouldNotCall, 'onSuccess')

test('does not execute onFailure if not given an action', shouldNotCall, 'onFailure')

test('does not execute onLoading if not given an action', shouldNotCall, 'onLoading')
