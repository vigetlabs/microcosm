/**
 * Arguments
 * https://facebook.github.io/graphql/#sec-Language.Arguments
 */

import { getName, getValue } from './utilities'

function parseArgument(arg, variables) {
  switch (arg.value.kind) {
    case 'Variable':
      return variables[getName(arg)]
    case 'IntValue':
    case 'FloatValue':
    case 'BooleanValue':
      return JSON.parse(getValue(arg))
    default:
      return getValue(arg)
  }
}

export function parseArguments(args, variables) {
  let answer = {}

  for (var i = 0; i < args.length; i++) {
    var arg = args[i]
    answer[getName(arg)] = parseArgument(arg, variables)
  }

  return answer
}
