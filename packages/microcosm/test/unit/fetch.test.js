import { Microcosm, Observable } from 'microcosm'

const planets = [{ id: 'mercury' }, { id: 'venus' }, { id: 'earth' }]

const Planet = {
  identity() {
    return obj.id
  },

  all() {
    return new Observable(observer => {
      let timer = setTimeout(() => observer.complete(planets), 10)
      return () => clearTimeout(timer)
    })
  }
}

class Planets {
  entity = Planet
}

it('relies on entity classes for data operations', async () => {
  let repo = new Microcosm()

  repo.addDomain('planets', Planets)

  await repo.fetch('planets', 'all', true)

  expect(repo.state.planets).toEqual(planets)
})

it('can cancel fetches', async () => {
  let repo = new Microcosm()

  repo.addDomain('planets', Planets)

  let action = repo.fetch('planets', 'all', true)

  action.unsubscribe()

  await repo.history.wait()

  expect(repo.state.planets).toEqual(null)
})

it('can cancel fetches when composed', async () => {
  let repo = new Microcosm()

  repo.addDomain('planets', Planets)

  let planets = repo.fetch('planets', 'all', true)
  let subject = Observable.hash({ planets })

  subject.unsubscribe()

  expect(planets.status).toBe('unsubscribe')
  expect(repo.state.planets).toEqual(null)
})
