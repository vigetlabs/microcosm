import Observable from 'zen-observable'
import { get, set, clone } from 'microcosm'
import { createFinder } from './default-resolvers'
import { getName, observerHash } from './utilities'
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
  constructor(id, preparer, resolver, hasher) {
    this.id = id

    this.preparer = preparer || (() => Promise.resolve())
    this.resolver = resolver || noop
    this.hasher = hasher || defaultHashing

    this.prepareCache = {}
    this.resolveCache = {}
  }

  prepare(repo, args) {
    let key = this.hasher(null, args)

    if (key in this.prepareCache === false) {
      this.prepareCache[key] = this.preparer(repo, args)
    }

    return this.prepareCache[key]
  }

  resolve(repo, args, root) {
    let key = this.hasher(root, args)

    if (key in this.resolveCache === false) {
      this.resolveCache[key] = new Observable(observer => {
        let prep = this.prepare(repo, args)
        let last = undefined

        let sub = repo.observe().subscribe(state => {
          let next = this.resolver(root, args, state)

          if (next !== last) {
            last = next
            observer.next(next)
          }
        })

        prep.then(() => observer.complete(), err => observer.error())

        return () => {
          sub.unsubscribe()

          last = null
          prep = null
          sub = null
        }
      })
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
    // TODO: Could we guess root level queries?
    console.assert(
      field,
      `Missing "${key}". \n\nIs ${key} defined in your schema?`
    )

    if (key in this.answers === false) {
      let existing = get(this.resolvers, [definition.name, field.name], {})

      this.answers[key] = new Answer(
        key,
        existing.prepare,
        existing.resolver || createFinder(this.schema, definition, field)
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

    parent.pipe(getName(entry), question)

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
    return this.answer.resolve(context.repo, this.parameterize(context), root)
  }

  push(root, context) {
    let result = this.resolve(root, context)

    if (this.field.isList) {
      return result.flatMap(list => {
        return observerHash(list.map(i => this.trickle(i, context)))
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

    return observerHash(answer)
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
