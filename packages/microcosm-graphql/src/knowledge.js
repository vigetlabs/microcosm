import assert from 'assert'
import { Subject, Observable, get } from 'microcosm'
import { createFinder } from './default-resolvers'
import { getName } from './utilities'
import { parseArguments } from './arguments'

const noop = () => {}

function defaultHashing(root, args) {
  let code = ''

  if (root && 'id' in root) {
    code += root.id
  }

  for (var key in args) {
    code += key + ':' + args[key] + '|'
  }

  return code
}

class Answer {
  constructor(id, resolver, hasher) {
    this.id = id
    this.resolver = resolver || noop
    this.hasher = hasher || defaultHashing
    this.resolveCache = {}
  }

  resolve(repo, args, root) {
    let key = this.hasher(root, args)

    if (key in this.resolveCache === false) {
      this.resolveCache[key] = Observable.wrap(this.resolver(root, args, repo))
    }

    return this.resolveCache[key]
  }
}

export class Knowledge {
  constructor(schema, resolvers) {
    this.schema = schema
    this.resolvers = resolvers
    this.answers = {}
    this.root = new RootQuestion('root', {}, {})
  }

  resolve(key, definition, field) {
    assert(field, `Missing "${key}". \n\nIs ${key} defined in your schema?`)

    if (key in this.answers === false) {
      let existing = get(this.resolvers, [definition.name, field.name], null)

      this.answers[key] = new Answer(
        key,
        existing || createFinder(this.schema, definition, field)
      )
    }

    return this.answers[key]
  }

  spawn(entry, definition) {
    let name = entry.name.value
    let field = definition.fields[name]
    let key = definition.name + '.' + name

    return new Question(entry, field, this.resolve(key, definition, field))
  }

  plan(entry, definition, parent) {
    let question = this.spawn(entry, definition)

    get(entry, ['selectionSet', 'selections'], []).forEach(selection => {
      this.plan(selection, this.schema[question.type], question)
    })

    parent.pipe(
      getName(entry),
      question
    )

    return question
  }

  compile(entry) {
    entry.selectionSet.selections.forEach(selection => {
      this.plan(selection, this.schema.Query, this.root)
    })
  }

  run(context) {
    return this.root.push(context.repo.state, context)
  }
}

export class Question {
  constructor(entry, field, answer) {
    this.entry = entry
    this.field = field
    this.type = field.type
    this.answer = answer
    this.edges = {}
  }

  parameterize(context) {
    return parseArguments(this.entry.arguments, context.variables || {})
  }

  resolve(root, context) {
    return this.answer.resolver(root, this.parameterize(context), context.repo)
  }

  push(root, context) {
    let result = this.resolve(root, context)

    if (this.field.isList) {
      return result.flatMap(list => {
        return Subject.hash(list.map(i => this.trickle(i, context)))
      })
    }

    if (this.entry.selectionSet) {
      return result.flatMap(value => this.trickle(value, context))
    }

    return result
  }

  trickle(root, context) {
    if (root == null) {
      return Observable.of({ __missing: true })
    }

    let answer = {}
    for (var key in this.edges) {
      answer[key] = this.edges[key].push(root, context)
    }

    return Subject.hash(answer)
  }

  pipe(key, question) {
    this.edges[key] = question
  }
}

export class RootQuestion extends Question {
  push(root, context) {
    return this.trickle(root, context)
  }
}
