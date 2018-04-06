import React from 'react'
import { Subheading, Button } from './index'

const ToggleContainer = ({ microcosmView, switchView }) => (
  <div className='toggle-container'>
    <Subheading
      browserText="Microcosm"
      microcosmText="the browser"
      microcosmView={microcosmView}
      text="Meanwhile, in"
    />
    <Button switchView={switchView} microcosmView={microcosmView} />
  </div>
)

export default ToggleContainer
