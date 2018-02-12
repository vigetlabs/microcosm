// @flow

export function hasSymbol(name: string): boolean {
  return typeof Symbol === 'function' && Boolean(Symbol[name])
}

export function getSymbol(name: string): string | Symbol {
  return hasSymbol(name) ? Symbol[name] : '@@' + name
}

export const iterator = getSymbol('iterator')

export const observable = getSymbol('observable')

export const toStringTag = getSymbol('toStringTag')
