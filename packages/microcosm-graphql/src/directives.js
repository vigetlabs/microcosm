/**
 * This is a special MicrocosmGraphql directive that says "this type
 * is an object, not a list"
 */

function isNameSingular(directive) {
  return directive.name.value === 'singular'
}

export function isSingular(def) {
  return def.directives.some(isNameSingular)
}
