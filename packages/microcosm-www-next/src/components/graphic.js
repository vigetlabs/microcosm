import React from 'react'
import BrowserGraphic from './browser-graphic'

export default class Graphic extends React.Component {
  shouldComponentUpdate(nextProps) {
    let fadeClassChanged = nextProps.fadeClass !== this.props.fadeClass
    let viewChanged = nextProps.microcosmView !== this.props.microcosmView

    if (fadeClassChanged || viewChanged) {
      return true
    } else {
      return false
    }
  }

  render() {
    let section = this.props.section

    return (
      <figure
        id={'graphic-' + section}
        className={'section__graphic__figure ' + this.props.fadeClass}
        data-module="ObserveGraphic"
        data-section={section}
      >
        <div
          className={
            'flip-container' +
            (this.props.microcosmView || section === 0 || section == 9
              ? ''
              : ' -flipped')
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
  }
}
