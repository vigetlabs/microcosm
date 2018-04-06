import React from 'react'
import BrowserGraphic from './browser-graphic'

const Graphic = ({ microcosmView, atBookend, section, imageAlt }) => {
  let flippedClass = (microcosmView || atBookend) ? '' : ' -flipped'

  return (
    <figure className='section__graphic__figure'>
      <div className={'flip-container' + flippedClass}>
        <div className="flipper">
          <div className="flipper__front">
            <img
              data-src={`/${section}-microcosm.png`}
              className="lazyload microcosm-graphic"
              alt={`Microcosm View: ${imageAlt}`}
            />
          </div>
          <div className="flipper__back">
            <BrowserGraphic imageAlt={imageAlt} />
          </div>
        </div>
      </div>
    </figure>
  )
}

export default Graphic
