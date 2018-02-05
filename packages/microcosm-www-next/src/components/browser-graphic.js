import React from 'react'
import { cat } from '../images'

const BrowserGraphic = ({ imageAlt }) => (
  <div className="browser-graphic">
    <span className="screenreader-only">Browser View: {imageAlt}</span>
    <header>
      <p>Quizzfeed</p>
    </header>
    <main>
      <div className="content">
        <ol className="content__list">
          <li className="content__list__item">Cool</li>
          <li className="content__list__item">Curious</li>
          <li className="content__list__item">Calm</li>
          <li className="content__list__item">Cautious</li>
        </ol>
      </div>
      <div className="graphic">
        <img src={cat} className="graphic__img" alt="" />
      </div>
    </main>
  </div>
)

export default BrowserGraphic
