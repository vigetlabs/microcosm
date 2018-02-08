import { PureComponent, createElement } from 'react'
import { generateActionButton } from './action-button'
import { generateActionForm } from './action-form'
import { generatePresenter } from './presenter'
import { generateWithSend } from './with-send'

export const Presenter = generatePresenter(createElement, PureComponent)
export const ActionForm = generateActionForm(createElement, PureComponent)
export const ActionButton = generateActionButton(createElement, PureComponent)
export const withSend = generateWithSend(createElement, PureComponent)
