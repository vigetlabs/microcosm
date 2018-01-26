import React from 'react'
import BrowserGraphic from './browser-graphic'

const Graphic = ({ section, microcosmView }) => (
  <figure
    id={'graphic-' + section}
    className="section__graphic__figure"
    data-module="ObserveGraphic"
    data-section={section}
  >
    <div
      className={
        'flip-container' +
        (microcosmView || section === 0 || section == 9 ? '' : ' -flipped')
      }
    >
      <div className="flipper">
        <div className="flipper__front">
          <img
            data-src={`/${section}-microcosm.png`}
            className="lazyload microcosm-graphic"
            alt="TODO"
          />
        </div>
        <div className="flipper__back">
          <BrowserGraphic />
        </div>
      </div>
    </div>
  </figure>
)

export default Graphic
