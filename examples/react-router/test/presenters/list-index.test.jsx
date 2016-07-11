import test from 'ava'
import React from 'react'
import Todos from '../../app/todos'
import ListIndex from '../../app/presenters/list-index'
import {mount} from 'enzyme'

test('creates a list item when sent an addList intent', t => {
  const presenter = mount(<ListIndex app={ new Todos() } />).instance()

  presenter.send('addList', { name: 'Test' })
 
  t.is(presenter.state.lists.length, 1) 
})

test('removes a list item when sent a removeList intent', t => {
  const app = new Todos()

  app.reset({ lists: [{ id: 1 }] })

  const presenter = mount(<ListIndex app={ new Todos() } />).instance()

  presenter.send('removeList', { id: 1 })

  t.is(presenter.state.lists.length, 0)
})
