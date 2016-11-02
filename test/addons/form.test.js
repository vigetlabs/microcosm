import React from 'react'
import Form from '../../src/addons/form'
import Action from '../../src/action'
import {mount} from 'enzyme'

test('executes onDone when that action completes', function () {
  const onDone = jest.fn()

  const form = mount(<Form intent="test" onDone={n => onDone(n)} />, {
    context: {
      send: () => new Action(n => n).resolve(true)
    }
  })

  form.simulate('submit')

  expect(onDone).toHaveBeenCalledWith(true)
})

test('executes onError when that action completes', function () {
  const onError = jest.fn()

  const form = mount(<Form intent="test" onError={n => onError(n)} />, {
    context: {
      send: () => new Action(n => n).reject('bad')
    }
  })

  form.simulate('submit')

  expect(onError).toHaveBeenCalledWith('bad')
})

test('executes onUpdate when that action sends an update', function () {
  const onUpdate = jest.fn()
  const action = new Action(n => n)

  const form = mount(<Form intent="test" onUpdate={n => onUpdate(n)} />, {
    context: {
      send: () => action
    }
  })

  form.simulate('submit')

  action.send('loading')

  expect(onUpdate).toHaveBeenCalledWith('loading')
})

test('does not execute onDone if not given an action', function () {
  const onDone = jest.fn()

  mount(<Form intent="test" onDone={n => onDone(n)} />, {
    context: {
      send: () => true
    }
  }).simulate('submit')

  expect(onDone).not.toHaveBeenCalled()
})

test('does not execute onDone if not given an action', function () {
  const onError = jest.fn()

  mount(<Form intent="test" onError={n => onError(n)} />, {
    context: {
      send: () => true
    }
  }).simulate('submit')

  expect(onError).not.toHaveBeenCalled()
})

test('does not execute onUpdate if not given an action', function () {
  const onUpdate = jest.fn()

  mount(<Form intent="test" onUpdate={n => onUpdate(n)} />, {
    context: {
      send: () => true
    }
  }).simulate('submit')

  expect(onUpdate).not.toHaveBeenCalled()
})


test('submit can be called directly on the component instance', function () {
  const onDone = jest.fn()

  const form = mount(<Form intent="test" onDone={n => onDone(n)} />, {
    context: {
      send: () => new Action(n => n).resolve(true)
    }
  })

  form.instance().submit()

  expect(onDone).toHaveBeenCalledWith(true)
})
