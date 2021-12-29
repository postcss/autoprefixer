let { equal, type, is } = require('uvu/assert')
let { parse } = require('postcss')
let { test } = require('uvu')

let Prefixer = require('../lib/prefixer')

let prefix, css
test.before.each(() => {
  prefix = new Prefixer()
  css = parse(
    '@-ms-keyframes a { to { } } ' +
      ':-moz-full-screen { } a { } ' +
      '@-dev-keyframes s { to { } }'
  )
})

test('registers hacks for subclasses', () => {
  class A extends Prefixer {}
  class Hack extends A {}
  Hack.names = ['a', 'b']

  A.hack(Hack)

  equal(A.hacks, { a: Hack, b: Hack })
  type(Prefixer.hacks, 'undefined')
})

test('loads hacks', () => {
  class A extends Prefixer {
    constructor() {
      super()
      this.klass = 'a'
    }
  }
  class Hack extends A {
    constructor() {
      super()
      this.klass = 'hack'
    }
  }
  A.hacks = { hacked: Hack }

  equal(A.load('hacked').klass, 'hack')
  equal(A.load('a').klass, 'a')
})

test('cleans custom properties', () => {
  let rule = css.first.first
  rule._autoprefixerPrefix = '-ms-'
  rule._autoprefixerValues = { '-ms-': 1 }

  let cloned = Prefixer.clone(rule, { selector: 'from' })
  equal(cloned.selector, 'from')

  type(cloned._autoprefixerPrefix, 'undefined')
  type(cloned._autoprefixerValues, 'undefined')
})

test('fixed declaration between', () => {
  let parsed = parse('a { color : black }')
  let cloned = Prefixer.clone(parsed.first.first)
  equal(cloned.raws.between, ' : ')
})

test('works with root node', () => {
  is(prefix.parentPrefix(css), false)
})

test('finds in at-rules', () => {
  equal(prefix.parentPrefix(css.first), '-ms-')
})

test('finds in selectors', () => {
  equal(prefix.parentPrefix(css.nodes[1]), '-moz-')
})

test('finds in parents', () => {
  let decl = css.first.first
  equal(prefix.parentPrefix(decl), '-ms-')
  is(prefix.parentPrefix(css.nodes[2]), false)
})

test('caches prefix', () => {
  prefix.parentPrefix(css.first)
  equal(css.first._autoprefixerPrefix, '-ms-')

  css.first._autoprefixerPrefix = false
  is(prefix.parentPrefix(css.first), false)
})

test('finds only browsers prefixes', () => {
  is(prefix.parentPrefix(css.nodes[2]), false)
})

test('works with selector contained --', () => {
  let parsed = parse(':--a { color: black }')
  is(prefix.parentPrefix(parsed.first.first), false)
})

test.run()
