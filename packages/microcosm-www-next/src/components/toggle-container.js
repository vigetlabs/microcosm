import React from 'react'
import { BrowserIcon, PlanetIcon } from '../images'

const ToggleContainer = ({ typeClass, microcosmView, switchView }) => (
  <div className={'toggle-container ' + typeClass}>
    <h3 className="section__content__subheading">
      Meanwhile, in {microcosmView ? 'the browser' : 'Microcosm'}
    </h3>
    <button onClick={switchView} className="section__toggle-btn">
      {microcosmView ? <BrowserIcon /> : <PlanetIcon />}
      {microcosmView ? 'Browser View' : 'Microcosm View'}
    </button>
  </div>
)

export default ToggleContainer
