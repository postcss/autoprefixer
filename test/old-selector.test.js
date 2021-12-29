let { parse } = require('postcss')
let { test } = require('uvu')
let { is } = require('uvu/assert')

let Selector = require('../lib/selector')

let selector = new Selector('::selection', ['-moz-', '-ms-'])
let old = selector.old('-moz-')

test('returns true on last rule', () => {
  let css = parse('::selection {} ::-moz-selection {}')
  is(old.isHack(css.last), true)
})

test('stops on another type', () => {
  let css = parse('::-moz-selection {} ' + '@keyframes anim {} ::selection {}')
  is(old.isHack(css.first), true)
})

test('stops on another selector', () => {
  let css = parse('::-moz-selection {} a {} ::selection {}')
  is(old.isHack(css.first), true)
})

test('finds unprefixed selector', () => {
  let css = parse('::-moz-selection {} ' + '::-o-selection {} ::selection {}')
  is(old.isHack(css.first), false)
})

test('finds old selector', () => {
  let css = parse('body::-moz-selection {} body::selection {}')
  is(old.check(css.first), true)
})

test('finds right', () => {
  let css = parse('body:::-moz-selection {}')
  is(old.check(css.first), false)
})

test.run()
