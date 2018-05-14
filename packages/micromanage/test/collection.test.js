import { Entity, Collection } from 'micromanage'
import { Microcosm } from 'microcosm'

class Planet extends Entity {
  static schema = {
    properties: {
      name: { type: 'string' }
    }
  }
}

class Planets extends Collection(Planet) {}

class Repo extends Microcosm {
  setup() {
    this.addDomain('planets', Planets)
  }
}

it('creates records', async () => {
  let repo = new Repo()

  await repo.push(Planets.create, { id: 'earth', name: 'earth' })

  expect(repo.state.planets).toHaveProperty('earth')
})

it('updates records', async () => {
  let repo = new Repo()

  await repo.push(Planets.create, { id: 'earth', name: 'earth' })
  await repo.push(Planets.update, { id: 'earth', name: 'big-blue' })

  expect(repo.state.planets.earth).toHaveProperty('name', 'big-blue')
})

it('removes records', async () => {
  let repo = new Repo()

  await repo.push(Planets.create, { id: 'earth', name: 'earth' })
  await repo.push(Planets.destroy, 'earth')

  expect(repo.state.planets).not.toHaveProperty('earth')
})
