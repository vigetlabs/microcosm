import Subject from './subject'
import { START, NEXT, COMPLETE, ERROR } from './status'

export function register({ id, action, command }) {
  let subject = new Subject()

  action.subscribe({
    start: () => {
      subject.next({
        id: id,
        status: START,
        command: command,
        payload: action.valueOf()
      })
    },
    next: value => {
      subject.next({
        id: id,
        status: NEXT,
        command: command,
        payload: action.valueOf()
      })
    },
    complete: () => {
      subject.next({
        id: id,
        status: COMPLETE,
        command: command,
        payload: action.valueOf()
      })
      subject.complete()
    },
    error: () => {
      subject.error({
        id: id,
        status: ERROR,
        command: command,
        payload: action.valueOf()
      })
    }
  })

  return subject
}
