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
      rootMargin: '0px 0px 0px',
      threshold: 0.5,
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
    let isIntersecting = entry.intersectionRatio >= 0.5
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

  scroll = (e, num) => {
    e.preventDefault()

    this.oldLink = this.newLink ? this.newLink : document.getElementsByClassName('-active')[0]
    this.newLink = e.target

    this.oldLink.classList.remove('-active')
    this.newLink.classList.add('-active')

    window.scroll({
      top: document.getElementById(num).offsetTop - 400,
      left: 0,
      behavior: 'smooth'
    });
  }

  render() {
    let microcosmView = this.state.microcosmView
    let sectionData = data[this.state.currentSection]
    let text = microcosmView ? sectionData.microcosmText : sectionData.browserText
    let browserClass = !microcosmView ? ' -browserView' : ''

    return (
      <div className="wrapper">
        <aside className="section-nav">
          <nav>
            <ol className="section-nav__list">
              <li className="section-nav__list__link">
                <a href="#1" className="-active" onClick={(e) => {this.scroll(e, 1)}}>Rendering a View</a>
              </li>
              <li className="section-nav__list__link">
                <a  href="#2" onClick={(e) => {this.scroll(e, 2)}}>Creating an Action</a>
              </li>
              <li className="section-nav__list__link">
                <a  href="#3" onClick={(e) => {this.scroll(e, 3)}}>The Repository</a>
              </li>
            </ol>
          </nav>
        </aside>
        <section className="section">
          <div className="toggle-container -mobile">
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
            {this.sections.map(num => (
              <Graphic
                key={num}
                section={num}
                graphicUrl={microcosmView ? data[num].microcosmUrl : data[num].browserUrl}
              />
            ))}
          </div>
        </section>
      </div>
    )
  }
}
