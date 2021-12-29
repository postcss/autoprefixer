let { equal } = require('uvu/assert')
let { test } = require('uvu')

let Prefixes = require('../lib/prefixes')
let Browsers = require('../lib/browsers')
let Supports = require('../lib/supports')
let brackets = require('../lib/brackets')

let browsers = new Browsers(
  {
    firefox: {
      prefix: 'moz',
      versions: ['firefox 22']
    }
  },
  ['firefox 22', 'firefox 21']
)
let prefixes = new Prefixes(
  {
    a: {
      browsers: ['firefox 22']
    },
    b: {
      browsers: ['firefox 22'],
      props: 'c'
    }
  },
  browsers
)
let supports = new Supports(Prefixes, prefixes)

function rm(str) {
  let ast = supports.normalize(brackets.parse(str))
  return brackets.stringify(supports.remove(ast, str))
}

function clean(str) {
  let ast = supports.normalize(brackets.parse(str))
  return brackets.stringify(supports.cleanBrackets(ast))
}

test('splits property name and value', () => {
  equal(supports.parse('color:black'), ['color', 'black'])
})

test('cleans spaces', () => {
  equal(supports.parse(' color : black '), ['color', 'black'])
})

test('parses everything', () => {
  equal(supports.parse('color'), ['color', ''])
})

test('returns virtual rule', () => {
  let decl = supports.virtual('color: black')
  equal(decl.type, 'rule')
  equal(decl.toString(), 'a{color: black}')
})

test('works with broken CSS', () => {
  let decl = supports.virtual('color black')
  equal(decl.type, 'rule')
})

test('returns decls with prefixed property', () => {
  let decls = supports.prefixed('a: one')

  equal(decls.length, 2)
  equal(decls[0].toString(), '-moz-a: one')
  equal(decls[1].toString(), 'a: one')
})

test('returns decls with prefixed value', () => {
  let decls = supports.prefixed('c: b')

  equal(decls.length, 2)
  equal(decls[0].toString(), 'c: -moz-b')
  equal(decls[1].toString(), 'c: b')
})

test('reduces empty string', () => {
  equal(supports.normalize([['', ['a'], '']]), [[['a']]])
})

test('reduces declaration to string', () => {
  equal(supports.normalize(['a: b', ['1']]), ['a: b(1)'])
})

test('reduces wrapped declaration to string', () => {
  equal(supports.normalize(['', ['a: b', ['1']], '']), [['a: b(1)']])
})

test('remove prefixed properties', () => {
  equal(rm('(-moz-a: 1) or (a: 1)'), '(a: 1)')
})

test('remove prefixed properties inside', () => {
  equal(rm('(((-moz-a: 1) or (a: 1)))'), '(((a: 1)))')
})

test('remove prefixed values', () => {
  equal(rm('(c: -moz-b) or (c: -b-)'), '(c: -b-)')
})

test('keeps and-conditions', () => {
  equal(rm('(-moz-a: 1) and (a: 1)'), '(-moz-a: 1) and (a: 1)')
})

test('keeps not-conditions', () => {
  equal(rm('not (-moz-a: 1) or (a: 1)'), 'not (-moz-a: 1) or (a: 1)')
})

test('keeps hacks', () => {
  equal(rm('(-moz-a: 1) or (b: 2)'), '(-moz-a: 1) or (b: 2)')
})

test('uses only browsers with @supports support', () => {
  equal(supports.prefixer().browsers.selected, ['firefox 22'])
})

test('normalize brackets', () => {
  equal(clean('((a: 1))'), '(a: 1)')
})

test('normalize brackets recursively', () => {
  equal(clean('(((a: 1) or ((b: 2))))'), '((a: 1) or (b: 2))')
})

test('adds params with prefixed value', () => {
  let rule = { params: '(c: b)' }
  supports.process(rule)
  equal(rule.params, '((c: -moz-b) or (c: b))')
})

test('adds params with prefixed function', () => {
  let rule = { params: '(c: b(1))' }
  supports.process(rule)
  equal(rule.params, '((c: -moz-b(1)) or (c: b(1)))')
})

test('replaces params with prefixed property', () => {
  let rule = { params: '(color black) and not (a: 1)' }
  supports.process(rule)
  equal(rule.params, '(color black) and not ((-moz-a: 1) or (a: 1))')
})

test("shouldn't throw errors", () => {
  let rule = { params: 'not selector(:is(a, b))' }
  supports.process(rule)
  equal(rule.params, 'not selector(:is(a, b))')
})

test("shouldn't throw errors (2)", () => {
  let rule = { params: ' (selector( :nth-child(1n of a, b) )) or (c: b(1)) ' }
  supports.process(rule)
  equal(
    rule.params,
    ' (selector( :nth-child(1n of a, b) )) or ((c: -moz-b(1)) or (c: b(1))) '
  )
})

test.run()
