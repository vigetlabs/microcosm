import React from 'react'

const Header = ({ bookendClass, number, text }) => (
  <h2 className='section__content__heading'>
    <span className={bookendClass}>{number}</span>
    {text}
  </h2>
)

export default Header
