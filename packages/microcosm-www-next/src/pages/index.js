import React from 'react'
import data from '../data/index.json'
import {
  Description,
  Graphic,
  Header,
  SideNav,
  Subheading,
  ToggleContainer
} from '../components'

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
    this.observeOptions = {
      rootMargin: '-70px 0px -100px', //account for height of nav and footer
      threshold: [0, 0.45, 1]
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
    let targetEl = entry.target
    let section = parseInt(targetEl.dataset.section)
    let notAlreadyVisible = section !== this.state.currentSection

    if (entry.intersectionRatio >= 0.45) {
      this.fadeInGraphic(targetEl)

      if (notAlreadyVisible) {
        this.changeSection(section)
      }
    } else {
      this.fadeOutGraphic(targetEl)
    }
  }

  fadeInGraphic(el) {
    el.classList.add('-no-fade')
  }

  fadeOutGraphic(el) {
    el.classList.remove('-no-fade')
  }

  changeSection(section) {
    this.changeBgColor(this.state.currentSection, section)
    this.setState({ currentSection: section })
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
              <Header
                bookendClass={bookendClass}
                number={sectionData.num}
                text={sectionData.heading}
              />
              {!bookend ? (
                <Subheading
                  browserText="the browser"
                  microcosmText="Microcosm"
                  microcosmView={microcosmView}
                  text="In"
                />
              ) : null}
              <Description bookendClass={bookendClass} text={text} />
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
