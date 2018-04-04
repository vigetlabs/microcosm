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
    // this.setVars()
    // document.addEventListener('scroll', this.checkPosition())
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
      <div className="">
        {this.state.numSections.map(num => {
          let sectionNum = parseInt(num);

          return (
            <section
              className={'section -bg-' + sectionNum}
              id={'graphic-' + sectionNum}
              data-module="ObserveGraphic"
              data-section={sectionNum}
            >
              <div className="wrapper">
                {!data[sectionNum].bookend ? (
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
                      number={data[sectionNum].num}
                      text={data[sectionNum].heading}
                    />
                    {!data[sectionNum].bookend ? (
                      <Subheading
                        browserText="the browser"
                        microcosmText="Microcosm"
                        microcosmView={microcosmView}
                        text="In"
                      />
                    ) : null}
                    <Description num={sectionNum} text={data[sectionNum].microcosmText} />
                  </div>

                  {!data[sectionNum].bookend ? (
                    <ToggleContainer
                      typeClass="-desktop"
                      microcosmView={microcosmView}
                      switchView={this.switchView}
                    />
                  ) : null}
                </div>

                <div className="section__graphic">
                  <Graphic
                    key={sectionNum}
                    fadeClass={this.state.currentSection == num ? '-no-fade' : ''}
                    section={sectionNum}
                    imageAlt={data[sectionNum].heading}
                    microcosmView={microcosmView}
                  />
                </div>
              </div>
            </section>
          )
        })}
      </div>
    )
  }
}
