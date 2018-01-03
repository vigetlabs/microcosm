import React from 'react'
import data from '../data/index.json'

const SideNav = ({ graphics, currentSection }) => {

  const scrollToGraphic = (e, section) => {
    e.preventDefault()

    window.scroll({
      top: section.offsetTop - 400,
      left: 0,
      behavior: 'smooth',
    })
  }

  return (
    <aside className="section-nav">
      <nav>
        <ol className="section-nav__list">
          {graphics.length && graphics.map(graphic => {
            const id = parseInt(graphic.dataset.section)

            return (
              <li key={id} className="section-nav__list__link">
                <a
                  href={'#graphic-' + id}
                  className={id === currentSection ? '-active' : ''}
                  onClick={e => {
                    scrollToGraphic(e, graphic)
                  }}
                >
                  {data[id].heading}
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}

export default SideNav
