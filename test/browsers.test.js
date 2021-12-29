let { equal, is } = require('uvu/assert')
let { agents } = require('caniuse-lite')
let { join } = require('path')
let { test } = require('uvu')

let Browsers = require('../lib/browsers')

test('returns prefixes by default data', () => {
  equal(Browsers.prefixes(), ['-webkit-', '-moz-', '-ms-', '-o-'])
})

test('finds possible prefix', () => {
  is(Browsers.withPrefix('1 -o-calc(1)'), true)
  is(Browsers.withPrefix('1 calc(1)'), false)
})

test('allows to select no browsers', () => {
  let browsers = new Browsers(agents, [])
  equal(browsers.selected.length, 0)
})

test('selects by older version', () => {
  let browsers = new Browsers(agents, ['ie < 7'])
  equal(browsers.selected, ['ie 6', 'ie 5.5'])
})

test('combines requirements', () => {
  let browsers = new Browsers(agents, ['ie 10', 'ie < 6'])
  equal(browsers.selected, ['ie 10', 'ie 5.5'])
})

test('has aliases', () => {
  equal(new Browsers(agents, ['fx 10']).selected, ['firefox 10'])
  equal(new Browsers(agents, ['ff 10']).selected, ['firefox 10'])
})

test('ignores case', () => {
  equal(new Browsers(agents, ['Firefox 10']).selected, ['firefox 10'])
})

test('uses browserslist config', () => {
  let from = join(__dirname, 'cases/config/test.css')
  equal(new Browsers(agents, undefined, { from }).selected, ['ie 10'])
})

test('returns browser prefix', () => {
  let browsers = new Browsers(agents, ['chrome 30'])
  equal(browsers.prefix('chrome 30'), '-webkit-')
})

test('returns right prefix for Operas', () => {
  let browsers = new Browsers(agents, ['last 1 opera version'])
  equal(browsers.prefix('opera 12'), '-o-')
  equal(browsers.prefix(browsers.selected[0]), '-webkit-')
  equal(browsers.prefix('op_mob 12'), '-o-')
  equal(browsers.prefix(browsers.selected[0]), '-webkit-')
})

test('return true for selected browsers', () => {
  let browsers = new Browsers(agents, ['chrome 30', 'chrome 31'])
  is(browsers.isSelected('chrome 30'), true)
  is(browsers.isSelected('ie 6'), false)
})

test.run()
