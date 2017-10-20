type Schema = {
  [string]: Definition
}

type Definition = {
  name: string,
  isSingular: boolean,
  fields: {
    [string]: Field
  }
}

type Field = {
  name: string,
  type: string,
  isList: boolean
}

type Argument = {
  kind: 'Argument',
  name: Name,
  value: Value
}

type Name = {
  alias: ?string,
  kind: 'Name',
  value: string
}

// Input values:
// https://facebook.github.io/graphql/#sec-Input-Values
type InputValue =
  | 'Variable'
  | 'IntValue'
  | 'FloatValue'
  | 'StringValue'
  | 'BooleanValue'
  | 'NullValue'
  | 'EnumValue'
  | 'ListValue'
  | 'ObjectValue'

type Value = {
  kind: InputValue,
  value: string
}

type Variables = {
  [string]: mixed
}
