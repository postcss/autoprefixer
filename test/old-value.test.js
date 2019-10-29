let OldValue = require('../lib/old-value')

describe('.check()', () => {
  it('checks value in string', () => {
    let old = new OldValue('calc', '-o-calc')
    expect(old.check('1px -o-calc(1px)')).toBe(true)
    expect(old.check('1px calc(1px)')).toBe(false)
  })

  it('allows custom checks', () => {
    let old = new OldValue('calc', '-o-calc', 'calc', /calc/)
    expect(old.check('1px calc(1px)')).toBe(true)
  })
})
