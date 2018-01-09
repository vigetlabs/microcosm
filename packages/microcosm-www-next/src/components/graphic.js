import React from 'react'
import BrowserGraphic from './browser-graphic'

const Graphic = ({ section, microcosmView }) => (
  <figure
    id={'graphic-' + section}
    className="section__graphic__figure"
    data-module="ObserveGraphic"
    data-section={section}
  >
    {microcosmView || section === 0 || section == 9 ? (
      <img
        src={`/${section}-microcosm.png`}
        className="microcosm-graphic"
        alt="TODO"
      />
    ) : (
      <BrowserGraphic />
    )}
  </figure>
)

export default Graphic
