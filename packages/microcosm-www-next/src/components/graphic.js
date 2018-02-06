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
    let inMicrocosmView = this.props.microcosmView
    let atBookends = section === 0 || section == 9

    return (
      <figure
        id={'graphic-' + section}
        className={'section__graphic__figure ' + this.props.fadeClass}
        data-module="ObserveGraphic"
        data-section={section}
      >
        <div
          className={'flip-container' + (inMicrocosmView || atBookends ? '' : ' -flipped')}
        >
          <div className="flipper">
            <div className="flipper__front">
              <img
                data-src={`/${section}-microcosm.png`}
                className="lazyload microcosm-graphic"
                alt={`Microcosm View: ${this.props.imageAlt}`}
              />
            </div>
            <div className="flipper__back">
              <BrowserGraphic imageAlt={this.props.imageAlt} />
            </div>
          </div>
        </div>
      </figure>
    )
  }
}
