import Observable from 'zen-observable'
import { get, set, clone } from 'microcosm'
import { createFinder } from './default-resolvers'
import { hashcode, generateKey } from './hash'
import { getName, promiseHash, observerHash } from './utilities'
import { parseArguments } from './arguments'

const noop = () => {}

class Answer {
  constructor(id, prep, resolver) {
    this.id = id
    this.prepare = prep || noop
    this.resolver = resolver || noop

    this.cache = {}
    this.pool = new Map()
  }

  resolve(repo, args, root) {
    let key = this.toHash(root, args)

    if (key in this.cache === false) {
      this.cache[key] = new Observable(observer => {
        let prep = this.prepare(repo, args)

        let sub = repo.observe().subscribe(state => {
          observer.next(this.resolver(root, args, state))
        })

        if (prep) {
          Promise.resolve(prep).then(
            () => observer.complete(),
            err => observer.error()
          )
        } else {
          observer.complete()
        }

        return () => sub.unsubscribe()
      })
    }

    return this.cache[key]
  }

  toHash(root, args) {
    let code = this.id + ': '

    if (root && 'id' in root) {
      code += '/id:' + root.id + '/'
    } else {
      code += generateKey(root, this.pool) + '/'
    }

    for (var key in args) {
      code += key + ':' + args[key] + '/'
    }

    return code
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
