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

  shouldGraphicFlip() {
    let inMicrocosmView = this.props.microcosmView
    let atBookends = this.props.section === 0 || this.props.section == 9

    if (inMicrocosmView || atBookends) {
      return ''
    } else {
      return ' -flipped'
    }
  }

  render() {
    let section = this.props.section
    let flippedClass = this.shouldGraphicFlip()

    return (
      <figure
        id={'graphic-' + section}
        className={'section__graphic__figure ' + this.props.fadeClass}
        data-module="ObserveGraphic"
        data-section={section}
      >
        <div className={'flip-container' + flippedClass}>
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
