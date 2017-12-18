import React from 'react'
import data from '../data/index.json'
import Graphic from '../components/graphic'

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      numSections: 3,
      currentSection: 1,
      microcosmView: true,
    }
  }

  componentDidMount() {
    this.setVars()
    this.beginObserve()
  }

  setVars() {
    this.graphics = document.querySelectorAll('[data-module="ObserveGraphic"]')
    this.observeOptions = {
      root: null,
      rootMargin: '0px 0px 100px',
      threshold: 1.0,
    }
  }

  beginObserve() {
    //create new Observer instance
    let observer = new IntersectionObserver(
      this.onIntersection,
      this.observeOptions
    )

    //start observing each graphic
    this.graphics.forEach(graphic => observer.observe(graphic))
  }

  onIntersection = observed => {
    let entry = observed[0]
    let section = entry.target.dataset.section
    let notAlreadyVisible = section !== this.state.currentSection

    if (entry.isIntersecting & notAlreadyVisible) {
      this.setState({ currentSection: section })
    }
  }

  switchView = e => {
    this.setState({ microcosmView: !this.state.microcosmView })
  }

  render() {
    let sectionData = data[this.state.currentSection]
    let text = this.state.microcosmView
      ? sectionData.microcosmText
      : sectionData.browserText
    let graphicUrl = this.state.microcosmView
      ? sectionData.microcosmUrl
      : sectionData.browserUrl
    let browserClass = !this.state.microcosmView ? ' -browserView' : ''

    return (
      <div className="wrapper">
        <section className="section">
          <div className="section__content">
            <h2
              id="heading"
              className="section__content__heading"
              dangerouslySetInnerHTML={{ __html: sectionData.heading }}
            />

            <h3
              id="subheading-top"
              className={'section__content__subheading -top' + browserClass}
            >
              In
            </h3>
            <p
              id="text"
              className="section__content__text"
              dangerouslySetInnerHTML={{ __html: text }}
            />

            <h3
              id="subheading-bottom"
              className={'section__content__subheading -bottom' + browserClass}
            >
              Meanwhile, in
            </h3>
            <button
              onClick={this.switchView}
              className={'section__browser-btn' + browserClass}
            />
          </div>

          <div className="section__graphic">
            {Array(this.state.numSections)
              .fill()
              .map((el, i) => (
                <Graphic key={i} section={i + 1} graphicUrl={graphicUrl} />
              ))}
          </div>
        </section>
      </div>
    )
  }
}
