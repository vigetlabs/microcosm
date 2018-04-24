import { h, Component } from 'preact'
import { generateActionButton } from './action-button'
import { generateActionForm } from './action-form'
import { generatePresenter } from './presenter'
import { generateWithSend } from './with-send'

export const Presenter = generatePresenter(h, Component)
export const ActionForm = generateActionForm(h, Component)
export const ActionButton = generateActionButton(h, Component)
export const withSend = generateWithSend(h, Component)
