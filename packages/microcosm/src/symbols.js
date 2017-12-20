// @flow

export function hasSymbol(name: string): boolean {
  return typeof Symbol === 'function' && Boolean(Symbol[name])
}

export function getSymbol(name: string): string | Symbol {
  return hasSymbol(name) ? Symbol[name] : '@@' + name
}
