import { Microcosm } from 'microcosm'

describe('Microcosm::addEffect', function() {
  it.dev('will not add a null effect', () => {
    let repo = new Microcosm()

    expect(() => repo.addEffect(null)).toThrow(
      'Unable to create effect using addEffect(null).'
    )
  })
})
