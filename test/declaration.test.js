let { equal, is } = require('uvu/assert')
let { parse } = require('postcss')
let { test } = require('uvu')

let Declaration = require('../lib/declaration')
let Prefixes = require('../lib/prefixes')

let prefixes, tabsize
test.before.each(() => {
  prefixes = new Prefixes({}, {})
  tabsize = new Declaration('tab-size', ['-moz-', '-ms-'], prefixes)
})

test.after.each(() => {
  delete prefixes.options.cascade
})

test('checks values for other prefixes', () => {
  is(tabsize.otherPrefixes('black', '-moz-'), false)
  is(tabsize.otherPrefixes('-moz-black', '-moz-'), false)
  is(tabsize.otherPrefixes('-dev-black', '-moz-'), false)
  is(tabsize.otherPrefixes('-ms-black', '-moz-'), true)
})

test('returns true by default', () => {
  let css = parse('a {\n  tab-size: 4 }')
  is(tabsize.needCascade(css.first.first), true)
})

test('return false is disabled', () => {
  prefixes.options.cascade = false
  let css = parse('a {\n  tab-size: 4 }')
  is(tabsize.needCascade(css.first.first), false)
})

test('returns false on declarations in one line', () => {
  let css = parse('a { tab-size: 4 } a {\n  tab-size: 4 }')
  is(tabsize.needCascade(css.first.first), false)
  is(tabsize.needCascade(css.last.first), true)
})

test('returns max prefix length', () => {
  let decl = parse('a { tab-size: 4 }').first.first
  let list = ['-webkit-', '-webkit- old', '-moz-']
  equal(tabsize.maxPrefixed(list, decl), 8)
})

test('returns before with cascade', () => {
  let decl = parse('a { tab-size: 4 }').first.first
  let list = ['-webkit-', '-moz- old', '-moz-']
  equal(tabsize.calcBefore(list, decl, '-moz- old'), '    ')
})

test('removes cascade', () => {
  let css = parse('a {\n' + '  -moz-tab-size: 4;\n' + '       tab-size: 4 }')
  let decl = css.first.nodes[1]
  tabsize.restoreBefore(decl)
  equal(decl.raws.before, '\n  ')
})

test('returns prefixed property', () => {
  let css = parse('a { tab-size: 2 }')
  let decl = css.first.first
  equal(tabsize.prefixed(decl.prop, '-moz-'), '-moz-tab-size')
})

test('returns property name by specification', () => {
  equal(tabsize.normalize('tab-size'), 'tab-size')
})

test('adds prefixes', () => {
  let css = parse('a { -moz-tab-size: 2; tab-size: 2 }')
  tabsize.process(css.first.nodes[1])
  equal(css.toString(), 'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }')
})

test('checks parents prefix', () => {
  let css = parse('::-moz-selection a { tab-size: 2 }')
  tabsize.process(css.first.first)
  equal(css.toString(), '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }')
})

test('checks value for prefixes', () => {
  let css = parse('a { tab-size: -ms-calc(2) }')
  tabsize.process(css.first.first)
  equal(
    css.toString(),
    'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }'
  )
})

test('returns list of prefixeds', () => {
  equal(tabsize.old('tab-size', '-moz-'), ['-moz-tab-size'])
})

test.run()
