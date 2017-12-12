import Microcosm from 'microcosm'

describe('String middleware', function() {
  it('passes strings through as identify functions', async function() {
    let repo = new Microcosm({ debug: true })

    let payload = await repo.push('test', true)

    expect(payload).toBe(true)
  })
})
