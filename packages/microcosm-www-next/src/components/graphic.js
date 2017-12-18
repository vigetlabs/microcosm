import React from 'react'

const Graphic = ({ section, graphicUrl }) => (
  <figure>
    <img
      src={graphicUrl}
      alt="TODO"
      className="section__graphic__figure"
      data-module="ObserveGraphic"
      data-section={section}
    />
  </figure>
)

export default Graphic
