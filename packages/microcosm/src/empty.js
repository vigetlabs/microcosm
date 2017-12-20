/**
 * Safe empty states that are frozen to help track mutability issues.
 */

export const EMPTY_ARRAY = []

export const EMPTY_OBJECT = {}

Object.freeze(EMPTY_ARRAY)

Object.freeze(EMPTY_OBJECT)
