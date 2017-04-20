import Microcosm from '../../../src/microcosm'

import { BIRTH, START } from '../../../src/lifecycle'

describe('Lifecycle', function () {
  it('$birth should never be invoked directly', function () {
    let repo = new Microcosm()
    let test = repo.prepare(BIRTH)

    expect(test).toThrow()
  })

  it('$start should never be invoked directly', function () {
    let repo = new Microcosm()
    let test = repo.prepare(START)

    expect(test).toThrow()
  })
})
