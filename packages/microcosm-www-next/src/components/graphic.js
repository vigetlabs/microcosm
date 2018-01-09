import React from 'react'
import LazySizes from 'react-lazysizes'
import BrowserGraphic from './browser-graphic'

const Graphic = ({ section, microcosmView }) => (
  <figure
    id={'graphic-' + section}
    className="section__graphic__figure"
    data-module="ObserveGraphic"
    data-section={section}
  >
    {microcosmView || section === 0 || section == 9 ? (
      <LazySizes
        alt="TODO"
        className="microcosm-graphic"
        dataSrc={`/${section}-microcosm.png`} />
    ) : (
      <BrowserGraphic />
    )}
  </figure>
)

export default Graphic
