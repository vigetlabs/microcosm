/**
 * A common place to store data about the current environment
 */

export const hasWindow = typeof window !== 'undefined'

export const hasIdle = hasWindow && window.requestIdleCallback
