import { Component, h } from 'preact'
import { generateActionButton } from './action-button'
import { generateActionForm } from './action-form'
import { generatePresenter } from './presenter'
import { generateWithSend } from './with-send'
import { shallowDiffers } from './utilities'

class PureComponent extends Component {
  shouldComponentUpdate(props, state) {
    return (
      shallowDiffers(props, this.props) || shallowDiffers(state, this.state)
    )
  }
}

export const Presenter = generatePresenter(h, PureComponent)
export const ActionForm = generateActionForm(h, PureComponent)
export const ActionButton = generateActionButton(h, PureComponent)
export const withSend = generateWithSend(h, PureComponent)
