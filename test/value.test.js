let { equal, is, type } = require('uvu/assert')
let { parse } = require('postcss')
let { test } = require('uvu')

let Prefixes = require('../lib/prefixes')
let OldValue = require('../lib/old-value')
let Value = require('../lib/value')

let prefixes = new Prefixes()

let calc
test.before.each(() => {
  calc = new Value('calc', ['-moz-', '-ms-'])
})

test('clones declaration', () => {
  let css = parse('a { prop: v }')
  let width = css.first.first

  width._autoprefixerValues = { '-ms-': '-ms-v' }
  Value.save(prefixes, width)

  equal(css.toString(), 'a { prop: -ms-v; prop: v }')
})

test('updates declaration with prefix', () => {
  let css = parse('a { -ms-prop: v }')
  let width = css.first.first

  width._autoprefixerValues = { '-ms-': '-ms-v' }
  Value.save(prefixes, width)

  equal(css.toString(), 'a { -ms-prop: -ms-v }')
})

test('ignores on another prefix property', () => {
  let css = parse('a { -ms-prop: v; prop: v }')
  let width = css.first.last

  width._autoprefixerValues = { '-ms-': '-ms-v' }
  Value.save(prefixes, width)

  equal(css.toString(), 'a { -ms-prop: v; prop: v }')
})

test('ignores prefixes without changes', () => {
  let css = parse('a { prop: v }')
  let width = css.first.first

  width._autoprefixerValues = { '-ms-': 'v' }
  Value.save(prefixes, width)

  equal(css.toString(), 'a { prop: v }')
})

test('checks value in string', () => {
  let css = parse(
    'a { 0: calc(1px + 1em); ' +
      '1: 1px calc(1px + 1em); ' +
      '2: (calc(1px + 1em)); ' +
      '3: -ms-calc; ' +
      '4: calced; }'
  )

  is(calc.check(css.first.nodes[0]), true)
  is(calc.check(css.first.nodes[1]), true)
  is(calc.check(css.first.nodes[2]), true)

  is(calc.check(css.first.nodes[3]), false)
  is(calc.check(css.first.nodes[4]), false)
})

test('check prefixed value', () => {
  equal(calc.old('-ms-'), new OldValue('calc', '-ms-calc'))
})

test('adds prefix to value', () => {
  equal(calc.replace('1px calc(1em)', '-ms-'), '1px -ms-calc(1em)')
  equal(calc.replace('1px,calc(1em)', '-ms-'), '1px,-ms-calc(1em)')
})

test('adds prefixes', () => {
  let css = parse('a { width: calc(1em) calc(1%) }')
  let width = css.first.first

  calc.process(width)
  equal(width._autoprefixerValues, {
    '-moz-': '-moz-calc(1em) -moz-calc(1%)',
    '-ms-': '-ms-calc(1em) -ms-calc(1%)'
  })
})

test('checks parents prefix', () => {
  let css = parse('::-moz-fullscreen a { width: calc(1%) }')
  let width = css.first.first

  calc.process(width)
  equal(width._autoprefixerValues, { '-moz-': '-moz-calc(1%)' })
})

test('checks property prefix', () => {
  let css = parse('a { -moz-width: calc(1%); -o-width: calc(1%) }')
  let decls = css.first.nodes

  calc.process(decls[0])
  equal(decls[0]._autoprefixerValues, {
    '-moz-': '-moz-calc(1%)'
  })

  calc.process(decls[1])
  type(decls[1]._autoprefixerValues, 'undefined')
})

test.run()
