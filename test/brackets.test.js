let brackets = require('../lib/brackets')

describe('.parse()', () => {
  it('parses simple string', () => {
    expect(brackets.parse('test')).toEqual(['test'])
  })

  it('parses brackets', () => {
    expect(brackets.parse('a (b) a')).toEqual(['a ', ['b'], ' a'])
  })

  it('parses many brackets', () => {
    expect(brackets.parse('a (b ()) a'))
      .toEqual(['a ', ['b ', [''], ''], ' a'])
  })

  it('parses errors', () => {
    expect(brackets.parse('a (b (')).toEqual(['a ', ['b ', ['']]])
  })
})

describe('.stringify()', () => {
  it('stringifies simple string', () => {
    expect(brackets.stringify(['test'])).toEqual('test')
  })

  it('stringifies brackets', () => {
    expect(brackets.stringify(['a ', ['b'], ' a'])).toEqual('a (b) a')
  })

  it('stringifies many brackets', () => {
    expect(brackets.stringify(['a ', ['b ', [''], ''], ' a']))
      .toEqual('a (b ()) a')
  })
})
