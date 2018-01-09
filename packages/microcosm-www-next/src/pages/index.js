import React from 'react'
import data from '../data/index.json'
import { Graphic, SideNav, ToggleContainer } from '../components'

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSection: 0,
      graphicsMap: [],
      microcosmView: true,
      numSections: Object.keys(data)
    }
  }

  componentDidMount() {
    this.setVars()
    this.beginObserve()
  }

  setVars() {
    this.body = document.body
    this.graphics = document.querySelectorAll('[data-module="ObserveGraphic"]')
    this.intersectionThreshold = 1.0
    this.observeOptions = {
      rootMargin: '0px 0px 0px',
      threshold: this.intersectionThreshold
    }

    this.setGraphicsMap()
  }

  setGraphicsMap() {
    let graphicsMap = [].slice.call(this.graphics).reduce((map, graphic) => {
      map.push({
        num: parseInt(graphic.dataset.section),
        elem: graphic
      })

      return map
    }, [])

    this.setState({ graphicsMap })
  }

  beginObserve() {
    //create new Observer instance
    let observer = new IntersectionObserver(
      this.onIntersection,
      this.observeOptions
    )

    //start observing each graphic
    for (let i = 0; i < this.graphics.length; i++) {
      observer.observe(this.graphics[i])
    }
  }

  onIntersection = observed => {
    let entry = observed[0]
    let section = parseInt(entry.target.dataset.section)
    let isIntersecting = entry.intersectionRatio >= this.intersectionThreshold
    let notAlreadyVisible = section !== this.state.currentSection

    if (isIntersecting && notAlreadyVisible) {
      this.changeBgColor(this.state.currentSection, section)
      this.setState({ currentSection: section })
    }
  }

  changeBgColor(oldSection, newSection) {
    this.body.classList.remove(`bg-color-${oldSection}`)
    this.body.classList.add(`bg-color-${newSection}`)
  }

  switchView = () => {
    this.setState({ microcosmView: !this.state.microcosmView })
  }

  render() {
    let microcosmView = this.state.microcosmView
    let sectionData = data[this.state.currentSection]
    let bookend = sectionData.bookend
    let bookendClass = bookend ? '-end' : ''
    let text = microcosmView
      ? sectionData.microcosmText
      : sectionData.browserText

    return (
      <div className="wrapper">
        <SideNav
          currentSection={this.state.currentSection}
          graphics={this.state.graphicsMap}
        />

        <section className="section">
          {!bookend ? (
            <ToggleContainer
              typeClass="-mobile"
              microcosmView={microcosmView}
              switchView={this.switchView}
            />
          ) : null}
          <div className="section__content">
            <div className="text-container">
              <h2 className="section__content__heading">
                <span className={bookendClass}>{sectionData.num}</span>
                {sectionData.heading}
              </h2>
              {!bookend ? (
                <h3 className="section__content__subheading">
                  In {microcosmView ? 'Microcosm' : 'the browser'}
                </h3>
              ) : null}
              <p
                className={'section__content__text ' + bookendClass}
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>

            {!bookend ? (
              <ToggleContainer
                typeClass="-desktop"
                microcosmView={microcosmView}
                switchView={this.switchView}
              />
            ) : null}
          </div>

          <div className="section__graphic">
            {this.state.numSections.map(num => (
              <Graphic
                key={num}
                section={parseInt(num)}
                microcosmView={microcosmView}
              />
            ))}
          </div>
        </section>
      </div>
    )
  }
}
