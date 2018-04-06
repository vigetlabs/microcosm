import React from 'react'
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

  switchView = () => {
    this.setState({ microcosmView: !this.state.microcosmView })
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
            <section className={'section -bg-' + num}>
              <div className="wrapper">
                {/* {!bookend ? (
                  <ToggleContainer
                    typeClass="-mobile"
                    microcosmView={microcosmView}
                    switchView={this.switchView}
                  />
                ) : null} */}
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
