/**
 * Actions move through a specific set of states. This manifest
 * controls how they should behave.
 */
export const ACTION_STATES = [
  { key: 'open', disposable: false, once: true, listener: 'onOpen' },
  { key: 'update', disposable: false, once: false, listener: 'onUpdate' },
  { key: 'resolve', disposable: true, once: true, listener: 'onDone' },
  { key: 'reject', disposable: true, once: true, listener: 'onError' },
  { key: 'cancel',  disposable: true, once: true, listener: 'onCancel' }
]
