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
      microcosmView: true,
      numSections: Object.keys(data).map(key => parseInt(key))
    }
  }

  componentDidMount = () => {
    this.setVars()
    this.setStickySectionTop();
    this.bindEvents()
  }

  setVars = () => {
    this.threshold = 0.2;
    this.currentSection = 0;
    this.body = document.body
    this.sections = document.querySelectorAll('[data-section]')
  }

  setStickySectionTop = () => {
    let windowHeight = window.innerHeight

    this.sections.forEach(elem => {
      if (windowHeight < elem.clientHeight) {
        elem.style.top = windowHeight - elem.clientHeight + 'px'
      }
    })
  }

  bindEvents = () => {
    this.beginObserve()
    //window.addEventListener('resize', this.onResize())
  }

  beginObserve = () => {
    let observer = new IntersectionObserver(
      this.onIntersection,
      {threshold: this.threshold}
    )

    this.sections.forEach(section => observer.observe(section))
  }

  onResize = () => debounce(e => this.setStickySectionTop(), 150)

  onIntersection = observed => {
    let entry = observed[0]
    let section = parseInt(entry.target.dataset.section)
    let passedThreshold = entry.intersectionRatio >= this.threshold

    if (passedThreshold) {
      this.changeActiveSection(section)
    }
    else {
      this.changeActiveSection(section - 1)
    }
  }

  changeActiveSection(section) {
    let oldSection = this.currentSection
    let newSection = section

    this.body.classList.remove(`active-section-${oldSection}`)
    this.body.classList.add(`active-section-${newSection}`)

    this.currentSection = newSection;
  }

  switchView = () => {
    this.setState({ microcosmView: !this.state.microcosmView }, this.onViewSwitch)
  }

  onViewSwitch = () => {
    if (window.innerWidth < 960) {
      this.setStickySectionTop()
    }
  }

  render() {
    let microcosmView = this.state.microcosmView

    return (
      <main>
        {this.state.numSections.map(num => {
          let bookend         = num === 0 || num === 9;
          let sectionData     = data[num];
          let text = microcosmView ? sectionData.microcosmText : sectionData.browserText

          return (
            <section
              key={num}
              className={'section -bg-' + num}
              data-section={num}
            >
              <div className="wrapper">
                <div className="section__content">
                  <div className="text-container">
                    <Header
                      bookendClass={bookend ? '-end' : ''}
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
                    <Description
                      text={text}
                      microcosmView={microcosmView}
                    />
                  </div>
                  {!bookend ? (
                    <ToggleContainer
                      microcosmView={microcosmView}
                      switchView={this.switchView}
                    />
                  ) : null}
                </div>

                <div className="section__graphic">
                  <Graphic
                    atBookend={bookend ? true : false}
                    section={num}
                    imageAlt={sectionData.heading}
                    microcosmView={microcosmView}
                  />
                </div>
              </div>
            </section>
          )
        })}
      </main>
    )
  }
}
