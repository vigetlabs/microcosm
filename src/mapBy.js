/*
 * MapBy
 * Take a list and reduce it into an object
 */

export default function mapBy (array, fn, initial={}) {
  return array.reduce(function(memo, next) {
    memo[next] = fn(next)
    return memo
  }, initial)
}
