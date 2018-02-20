/**
 * This module describes how the Presenter's intercept feature works
 */

import { tag } from 'microcosm'
import { ensureArray } from './utilities'

export function intercept(mediator, command, ...params) {
  // Save a reference to the original repo. If an action is not intercepted,
  // the original repo receives the dispatch
  let repo = mediator.repo

  // Tag the command so that intercept works correctly
  let tagged = tag(command)

  while (mediator) {
    let registry = mediator.presenter.intercept()

    if (registry.hasOwnProperty(tagged)) {
      return ensureArray(registry[tagged]).reduce((_next, callback) => {
        return callback.call(mediator.presenter, mediator.repo, ...params)
      }, null)
    }

    mediator = mediator.context.parent
  }

  return repo.push(tagged, ...params)
}
