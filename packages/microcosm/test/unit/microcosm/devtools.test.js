import Microcosm from 'microcosm'

describe.skip('Microcosm devtools', function() {
  it('installs the devtools when enabled', function() {
    let emit = jest.fn()

    global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__ = { emit }

    let repo = new Microcosm({ debug: true })

    expect(emit).toHaveBeenCalledWith('init', repo)
  })

  it('adjusts the limit of history to Infinity', function() {
    global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__ = { emit: jest.fn() }

    let repo = new Microcosm({ debug: true })

    expect(repo.history.limit).toBe(Infinity)
  })

  it('does not fail when there is no dev tools hook', function() {
    global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__ = null

    // More or less, this should not break
    new Microcosm({ debug: true })
  })
})
