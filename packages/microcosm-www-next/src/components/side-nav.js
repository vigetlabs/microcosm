import React from 'react'
import data from '../data/index.json'

export default class SideNav extends React.Component {
  componentDidMount() {
    this.elementsMap = this.props.sections.reduce((map, section) => {
      map[section] = document.getElementById('graphic-' + section)
      return map
    }, {})
  }

  onClick = (e, num) => {
    e.preventDefault()
    this.changeClasses(e.target)
    this.scrollToSection(num)
  }

  changeClasses = elem => {
    this.prevLink = this.currLink
      ? this.currLink
      : document.getElementsByClassName('-active')[0]
    this.currLink = elem

    this.prevLink.classList.remove('-active')
    this.currLink.classList.add('-active')
  }

  scrollToSection = num => {
    window.scroll({
      top: this.elementsMap[num].offsetTop - 400,
      left: 0,
      behavior: 'smooth',
    })
  }

  render() {
    return (
      <aside className="section-nav">
        <nav>
          <ol className="section-nav__list">
            {this.props.sections.map(section => (
              <li key={section} className="section-nav__list__link">
                <a
                  href={'#graphic-' + section}
                  className={section === 1 ? '-active' : ''}
                  onClick={e => {
                    this.onClick(e, section)
                  }}
                >
                  {data[section].heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>
    )
  }
}
