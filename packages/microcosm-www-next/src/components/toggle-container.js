import React from 'react'
import { Subheading, Button } from './index'

const ToggleContainer = ({ microcosmView, switchView }) => (
  <div className="toggle-container">
    <Subheading
      browserText="Want to check back with Microcosm?"
      microcosmText="Okay, let’s look at what’s happening in the browser."
      microcosmView={microcosmView}
    />
    <Button switchView={switchView} microcosmView={microcosmView} />
  </div>
)

export default ToggleContainer
