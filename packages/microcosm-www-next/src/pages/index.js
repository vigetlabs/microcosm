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
    this.sections = document.querySelectorAll('[data-section]')
    this.setStickySectionTop();

    window.addEventListener('resize', this.onResize())
  }

  setStickySectionTop = () => {
    let windowHeight = window.innerHeight

    this.sections.forEach(elem => {
      if (windowHeight < elem.clientHeight) {
        elem.style.top = windowHeight - elem.clientHeight + 'px'
      }
    })
  }

  onResize = () => debounce(e => this.setStickySectionTop(), 150)

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
              data-section
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
