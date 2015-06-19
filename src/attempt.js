module.exports = function attempt (obj, key, args, fallback, scope) {
  return obj && obj[key] ? obj[key].apply(scope || obj, args) : fallback
}
