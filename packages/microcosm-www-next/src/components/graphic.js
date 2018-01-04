import React from 'react'

const Graphic = ({ section, microcosmView }) => (
  <figure
    id={'graphic-' + section}
    className="section__graphic__figure"
    data-module="ObserveGraphic"
    data-section={section}
  >
    <img src={microcosmView ? `/${section}-microcosm.png` : `/${section}-browser.png`} alt="TODO" />
  </figure>
)

export default Graphic
