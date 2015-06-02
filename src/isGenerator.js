module.exports = function isGenerator(value) {
  return value && typeof value.next === 'function'
}
