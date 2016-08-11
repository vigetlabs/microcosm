import test from 'ava'
import React from 'react'
import Form from '../../src/addons/form'
import Action from '../../src/action'
import {mount} from 'enzyme'

test('executes onDone when that action completes', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onDone={ () => t.pass() } />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.close()
})

test('executes onError when that action completes', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onError={ () => t.pass() } />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.reject()
})

test('executes onUpdate when that action sends an update', t => {
  t.plan(1)

  const action = new Action(n => n)

  const form = mount(<Form intent="test" onUpdate={ () => t.pass() } />, {
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

test('does not execute onDone if not given an action', shouldNotCall, 'onDone')

test('does not execute onError if not given an action', shouldNotCall, 'onError')

test('does not execute onUpdate if not given an action', shouldNotCall, 'onUpdate')
