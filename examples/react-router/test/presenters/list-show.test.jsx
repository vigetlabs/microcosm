import test from 'ava'
import React from 'react'
import Todos from '../../app/todos'
import ListShow from '../../app/presenters/list-show'
import {mount} from 'enzyme'

test('creates a list item when sent the addItem intent', t => {
  const presenter = mount(<ListShow repo={ new Todos() } params={{ id: 2 } } />)

  presenter.instance().send('addItem', { list: 2, name: 'Test' })

  t.is(presenter.state('items').length, 1)
})

test('removes a list item when sent the removeItem intent', t => {
  const repo = new Todos()
  const presenter = mount(<ListShow repo={ repo } params={{ id: 2 } } />)

  repo.reset({ items: [{ id: 2, list: 1 }]})

  presenter.instance().send('removeItem', { id: 2 })

  t.is(presenter.state('items').length, 0)
})
