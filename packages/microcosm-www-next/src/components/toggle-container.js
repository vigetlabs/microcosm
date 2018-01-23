import React from 'react'
import { Subheading, Button } from './index'

const ToggleContainer = ({ typeClass, microcosmView, switchView }) => (
  <div className={'toggle-container ' + typeClass}>
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
