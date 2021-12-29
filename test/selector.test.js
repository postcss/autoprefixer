let { equal, is } = require('uvu/assert')
let { parse } = require('postcss')
let { test } = require('uvu')

let Selector = require('../lib/selector')

let selector, prefixeds
test.before.each(() => {
  selector = new Selector('::selection', ['-moz-', '-ms-'])
  prefixeds = selector.prefixeds(parse('::selection {}').first)
})

test('adds prefix after non-letters symbols', () => {
  equal(selector.prefixed('-moz-'), '::-moz-selection')
})

test('creates regexp for prefix', () => {
  let regexp = selector.regexp('-moz-')
  is(regexp.test('::-moz-selection'), true)
  is(regexp.test('::selection'), false)
})

test('creates regexp without prefix', () => {
  let regexp = selector.regexp()
  is(regexp.test('::-moz-selection'), false)
  is(regexp.test('::selection'), true)
})

test('checks rule selectors', () => {
  let css = parse(
    'body .selection {}, ' + ':::selection {}, body ::selection {}'
  )
  is(selector.check(css.nodes[0]), false)
  is(selector.check(css.nodes[1]), false)
  is(selector.check(css.nodes[2]), true)
})

test('grouping rule gets correct _autoprefixerPrefixeds property', () => {
  let css = parse('.c::selection, .d:read-only {}')
  let rSel = new Selector(':read-only', ['-moz-'])
  selector.prefixeds(css.first)
  rSel.prefixeds(css.first)
  equal(css.first._autoprefixerPrefixeds, {
    '::selection': {
      '-webkit-': '.c::-webkit-selection',
      '-moz-': '.c::-moz-selection',
      '-ms-': '.c::-ms-selection',
      '-o-': '.c::-o-selection'
    },
    ':read-only': {
      '-webkit-': '.d:-webkit-read-only',
      '-moz-': '.d:-moz-read-only',
      '-ms-': '.d:-ms-read-only',
      '-o-': '.d:-o-read-only'
    }
  })
})

test('returns all available prefixed selectors', () => {
  let css = parse('::selection {}')
  equal(selector.prefixeds(css.first), {
    '::selection': {
      '-webkit-': '::-webkit-selection',
      '-moz-': '::-moz-selection',
      '-ms-': '::-ms-selection',
      '-o-': '::-o-selection'
    }
  })
})

test('returns false on first element', () => {
  let css = parse('::selection {}')
  is(selector.already(css.first, prefixeds, '-moz-'), false)
})

test('stops on another type', () => {
  let css = parse('::-moz-selection {} ' + '@keyframes anim {} ::selection {}')
  is(selector.already(css.nodes[2], prefixeds, '-moz-'), false)
})

test('stops on another selector', () => {
  let css = parse('::-moz-selection {} a {} ::selection {}')
  is(selector.already(css.nodes[2], prefixeds, '-moz-'), false)
})

test('finds prefixed even if unknown prefix is between', () => {
  let css = parse('::-moz-selection {} ' + '::-o-selection {} ::selection {}')
  is(selector.already(css.nodes[2], prefixeds, '-moz-'), true)
})

test('adds prefix to selectors', () => {
  equal(
    selector.replace('body ::selection, input::selection, a', '-ms-'),
    'body ::-ms-selection, input::-ms-selection, a'
  )
})

test('adds prefixes', () => {
  let css = parse('b ::-moz-selection{} b ::selection{}')
  selector.process(css.nodes[1])
  equal(
    css.toString(),
    'b ::-moz-selection{} b ::-ms-selection{} b ::selection{}'
  )
})

test('checks parents prefix', () => {
  let css = parse('@-moz-page{ ::selection{} }')
  selector.process(css.first.first)
  equal(css.toString(), '@-moz-page{ ::-moz-selection{} ::selection{} }')
})

test('returns object to find old selector', () => {
  let old = selector.old('-moz-')
  equal(old.unprefixed, '::selection')
  equal(old.prefix, '-moz-')
})

test.run()
