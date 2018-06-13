import { createElement, Component } from 'react'
import { generateActionButton } from './action-button'
import { generateActionForm } from './action-form'
import { generatePresenter } from './presenter'
import { generateWithSend } from './with-send'

export const Presenter = generatePresenter(createElement, Component)
export const ActionForm = generateActionForm(createElement, Component)
export const ActionButton = generateActionButton(createElement, Component)
export const withSend = generateWithSend(createElement, Component)

export { Query } from './query'
export { RepoContext } from './repo-provider'
