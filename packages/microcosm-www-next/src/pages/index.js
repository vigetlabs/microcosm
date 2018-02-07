import React from 'react'
import debounce from 'lodash.debounce'
import data from '../data/index.json'
import {
  Description,
  Graphic,
  Header,
  Subheading,
  ToggleContainer
} from '../components'

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSection: 0,
      microcosmView: true,
      numSections: Object.keys(data)
    }
  }

  componentDidMount() {
    this.setVars()
    document.addEventListener('scroll', this.checkPosition())
  }

  setVars() {
    this.body = document.body
    this.setSectionPositions(
      document.querySelectorAll('[data-module="ObserveGraphic"]')
    )
  }

  setSectionPositions(graphics) {
    this.sectionPositions = [].slice.call(graphics).reduce((map, graphic) => {
      map[graphic.dataset.section] =
        graphic.offsetTop + graphic.offsetHeight / 2
      return map
    }, {})
  }

  checkPosition() {
    return debounce(e => {
      let scrollPosition = e.target.scrollingElement.scrollTop

      for (let key in this.sectionPositions) {
        let section = parseInt(key)
        let graphicInViewport = scrollPosition < this.sectionPositions[section]
        let atPageEnd = section === 9

        if (graphicInViewport || atPageEnd) {
          let notAlreadyVisible = section !== this.state.currentSection

          if (notAlreadyVisible) {
            this.changeSection(section)
          }

          break
        }
      }
    }, 50)
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
                fadeClass={this.state.currentSection == num ? '-no-fade' : ''}
                section={parseInt(num)}
                imageAlt={sectionData.heading}
                microcosmView={microcosmView}
              />
            ))}
          </div>
        </section>
      </div>
    )
  }
}
