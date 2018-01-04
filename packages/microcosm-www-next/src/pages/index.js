import React from 'react'
import data from '../data/index.json'
import SideNav from '../components/side-nav'
import Graphic from '../components/graphic'

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentSection: 1,
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
    let text = microcosmView
      ? sectionData.microcosmText
      : sectionData.browserText
    let browserClass = !microcosmView ? ' -browserView' : ''

    return (
      <div className="wrapper">
        <SideNav
          currentSection={this.state.currentSection}
          graphics={this.state.graphicsMap}
        />

        <section className="section">
          <div className="toggle-container -mobile">
            <h3
              className={'section__content__subheading -bottom' + browserClass}
            >
              Meanwhile, in
            </h3>
            <button
              onClick={this.switchView}
              className={'section__toggle-btn' + browserClass}
            />
          </div>

          <div className="section__content">
            <div className="text-container">
              <h2 className="section__content__heading">
                <span>{sectionData.num}</span>
                {sectionData.heading}
              </h2>
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

            <div className="toggle-container -desktop">
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
            {this.state.numSections.map(num => (
              <Graphic
                key={num}
                section={num}
                graphicUrl={
                  microcosmView ? data[num].microcosmUrl : data[num].browserUrl
                }
              />
            ))}
          </div>
        </section>
      </div>
    )
  }
}
