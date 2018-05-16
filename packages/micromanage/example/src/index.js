import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { Application } from './views/application'
import { Repo } from './repo'

ReactDOM.render(
  <Application repo={new Repo()} />,
  document.getElementById('app')
)
