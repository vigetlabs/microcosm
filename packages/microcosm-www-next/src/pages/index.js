import React from 'react'
import data from '../data/index.json'
import Graphic from '../components/graphic'

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      numSections: 3,
      currentSection: 1,
      microcosmView: true
    }
  }

  componentWillMount() {
    this.sections = this.createSectionsArray()
  }

  componentDidMount() {
    this.setVars()
    this.beginObserve()
  }

  setVars() {
    this.body = document.body
    this.graphics = document.querySelectorAll('[data-module="ObserveGraphic"]')
    this.observeOptions = {
      root: null,
      rootMargin: '0px 0px 100px',
      threshold: 1.0
    }
  }

  createSectionsArray() {
    let arr = []

    for (let i = 0; i < this.state.numSections; i++) {
      arr.push(i + 1)
    }

    return arr
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
    let notAlreadyVisible = section !== this.state.currentSection

    if (entry.isIntersecting && notAlreadyVisible) {
      this.changeBgColor(this.state.currentSection, section)
      this.setState({ currentSection: section })
    }
  }

  changeBgColor(oldSection, newSection) {
    this.body.classList.remove(`bg-color-${oldSection}`)
    this.body.classList.add(`bg-color-${newSection}`)
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
            <div className="text-container">
              <h2
                className="section__content__heading"
                dangerouslySetInnerHTML={{ __html: sectionData.heading }}
              />
              <h3
                className={'section__content__subheading -top' + browserClass}
              >
                In
              </h3>
              <p
                className="section__content__text"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>

            <div className="toggle-container">
              <h3
                className={
                  'section__content__subheading -bottom' + browserClass
                }
              >
                Meanwhile, in
              </h3>
              <button
                onClick={this.switchView}
                className={'section__toggle-btn' + browserClass}
              />
            </div>
          </div>

          <div className="section__graphic">
            {this.sections.map(num => (
              <Graphic key={num} section={num} graphicUrl={graphicUrl} />
            ))}
          </div>
        </section>
      </div>
    )
  }
}
