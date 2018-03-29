import React from 'react'
import ReactDOM from 'react-dom'
import { Repo } from './repo'
import { PlanetForm } from './views/planet-form'

let container = document.createElement('div')

document.body.appendChild(container)

ReactDOM.render(<PlanetForm repo={new Repo()} />, container)
