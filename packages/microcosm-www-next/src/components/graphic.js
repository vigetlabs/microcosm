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
        dataSrc={`/${section}-microcosm.png`}
        className="microcosm-graphic"
        alt="TODO"
      />
    ) : (
      <BrowserGraphic />
    )}
  </figure>
)

export default Graphic
