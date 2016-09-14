import test from 'ava'
import Provider from '../../src/addons/provider'
import Connect from '../../src/addons/connect'
import Microcosm from '../../src/microcosm'
import React from 'react'
import {mount} from 'enzyme'

test('injects an repo from context into the wrapped component', t => {
  const repo    = new Microcosm()
  const Child  = () => (<p>Test</p>)
  const Parent = Connect()(Child)

  const component = mount(<Provider repo={repo}><Parent /></Provider>)
  t.is(component.find(Child).prop('repo'), repo)
})
