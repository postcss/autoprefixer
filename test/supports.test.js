let Prefixes = require('../lib/prefixes')
let Browsers = require('../lib/browsers')
let Supports = require('../lib/supports')
let brackets = require('../lib/brackets')

let browsers = new Browsers({
  firefox: {
    prefix: 'moz',
    versions: ['firefox 22']
  }
}, [
  'firefox 22', 'firefox 21'
])
let prefixes = new Prefixes({
  a: {
    browsers: ['firefox 22']
  },
  b: {
    browsers: ['firefox 22'],
    props: 'c'
  }
}, browsers)
let supports = new Supports(Prefixes, prefixes)

function rm (str) {
  let ast = supports.normalize(brackets.parse(str))
  return brackets.stringify(supports.remove(ast, str))
}

function clean (str) {
  let ast = supports.normalize(brackets.parse(str))
  return brackets.stringify(supports.cleanBrackets(ast))
}

describe('parse()', () => {
  it('splits property name and value', () => {
    expect(supports.parse('color:black'))
      .toEqual(['color', 'black'])
  })

  it('cleans spaces', () => {
    expect(supports.parse(' color : black '))
      .toEqual(['color', 'black'])
  })

  it('parses everything', () => {
    expect(supports.parse('color')).toEqual(['color', ''])
  })
})

describe('virtual()', () => {
  it('returns virtual rule', () => {
    let decl = supports.virtual('color: black')
    expect(decl.type).toEqual('rule')
    expect(decl.toString()).toEqual('a{color: black}')
  })

  it('works with broken CSS', () => {
    let decl = supports.virtual('color black')
    expect(decl.type).toEqual('rule')
  })
})

describe('prefixed()', () => {
  it('returns decls with prefixed property', () => {
    let decls = supports.prefixed('a: one')

    expect(decls).toHaveLength(2)
    expect(decls[0].toString()).toEqual('-moz-a: one')
    expect(decls[1].toString()).toEqual('a: one')
  })

  it('returns decls with prefixed value', () => {
    let decls = supports.prefixed('c: b')

    expect(decls).toHaveLength(2)
    expect(decls[0].toString()).toEqual('c: -moz-b')
    expect(decls[1].toString()).toEqual('c: b')
  })
})

describe('normalize()', () => {
  it('reduces empty string', () => {
    expect(supports.normalize([['', ['a'], '']]))
      .toEqual([[['a']]])
  })

  it('reduces declaration to string', () => {
    expect(supports.normalize(['a: b', ['1']]))
      .toEqual(['a: b(1)'])
  })

  it('reduces wrapped declaration to string', () => {
    expect(supports.normalize(['', ['a: b', ['1']], '']))
      .toEqual([['a: b(1)']])
  })
})

describe('remove()', () => {
  it('remove prefixed properties', () => {
    expect(rm('(-moz-a: 1) or (a: 1)')).toEqual('(a: 1)')
  })

  it('remove prefixed properties inside', () => {
    expect(rm('(((-moz-a: 1) or (a: 1)))')).toEqual('(((a: 1)))')
  })

  it('remove prefixed values', () => {
    expect(rm('(c: -moz-b) or (c: -b-)')).toEqual('(c: -b-)')
  })

  it('keeps and-conditions', () => {
    expect(rm('(-moz-a: 1) and (a: 1)'))
      .toEqual('(-moz-a: 1) and (a: 1)')
  })

  it('keeps not-conditions', () => {
    expect(rm('not (-moz-a: 1) or (a: 1)'))
      .toEqual('not (-moz-a: 1) or (a: 1)')
  })

  it('keeps hacks', () => {
    expect(rm('(-moz-a: 1) or (b: 2)'))
      .toEqual('(-moz-a: 1) or (b: 2)')
  })
})

describe('prefixer()', () => {
  it('uses only browsers with @supports support', () => {
    expect(supports.prefixer().browsers.selected)
      .toEqual(['firefox 22'])
  })
})

describe('cleanBrackets()', () => {
  it('normalize brackets', () => {
    expect(clean('((a: 1))')).toEqual('(a: 1)')
  })

  it('normalize brackets recursively', () => {
    expect(clean('(((a: 1) or ((b: 2))))'))
      .toEqual('((a: 1) or (b: 2))')
  })
})

describe('process()', () => {
  it('adds params with prefixed value', () => {
    let rule = { params: '(c: b)' }
    supports.process(rule)
    expect(rule.params).toEqual('((c: -moz-b) or (c: b))')
  })

  it('adds params with prefixed function', () => {
    let rule = { params: '(c: b(1))' }
    supports.process(rule)
    expect(rule.params).toEqual('((c: -moz-b(1)) or (c: b(1)))')
  })

  it('replaces params with prefixed property', () => {
    let rule = { params: '(color black) and not (a: 1)' }
    supports.process(rule)
    expect(rule.params)
      .toEqual('(color black) and not ((-moz-a: 1) or (a: 1))')
  })
})
