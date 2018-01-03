import Microcosm from 'microcosm'

describe('Microcosm devtools', function() {
  it('installs the devtools when enabled', function() {
    let emit = jest.fn()

    global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__ = { emit }

    let repo = new Microcosm({ debug: true })

    expect(emit).toHaveBeenCalledWith('init', repo)
  })

  it('does not fail when there is no dev tools hook', function() {
    global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__ = null

    // More or less, this should not break
    new Microcosm({ debug: true })
  })
})
