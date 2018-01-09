import React from 'react'
import { cat } from '../images'

const BrowserGraphic = () => (
  <div className="browser-graphic">
    <header>
      <p>Quizzfeed</p>
    </header>
    <main>
      <div className="content">
        <ol className="content__list">
          <li>Cool</li>
          <li>Curious</li>
          <li>Calm</li>
          <li>Cautious</li>
        </ol>
      </div>
      <div className="graphic">
        <img src={cat} className="graphic__img" alt="TODO" />
      </div>
    </main>
  </div>
)

export default BrowserGraphic
