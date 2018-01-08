import React from 'react'
import { cat } from '../images'

const Graphic = ({ section, microcosmView }) => (
  <figure
    id={'graphic-' + section}
    className="section__graphic__figure"
    data-module="ObserveGraphic"
    data-section={section}
  >
    {
      microcosmView ?
        <img src={`/${section}-microcosm.png`} className="microcosm-graphic" alt="TODO" />
      :
        <div className="browser-graphic">
          <header>
            <p>Quizzfeed</p>
          </header>
          <main>
            <div className="content">
              <ol>
                <li>Cool</li>
                <li>Curious</li>
                <li>Calm</li>
                <li>Cautious</li>
              </ol>
            </div>
            <div className="graphic">
              <img src={cat} alt="TODO" />
            </div>
          </main>
        </div>
    }
  </figure>
)

export default Graphic
