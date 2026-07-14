let { test } = require('uvu')
let { equal } = require('uvu/assert')

let brackets = require('../lib/brackets')

test('parses simple string', () => {
  equal(brackets.parse('test'), ['test'])
})

test('parses brackets', () => {
  equal(brackets.parse('a (b) a'), ['a ', ['b'], ' a'])
})

test('parses many brackets', () => {
  equal(brackets.parse('a (b ()) a'), ['a ', ['b ', [''], ''], ' a'])
})

test('parses errors', () => {
  equal(brackets.parse('a (b ('), ['a ', ['b ', ['']]])
})

test('parses unmatched closing bracket', () => {
  equal(brackets.parse('@supports ) {}'), ['@supports ) {}'])
  equal(brackets.parse('@supports (display:flex)) {}'), [
    '@supports ',
    ['display:flex'],
    ') {}'
  ])
  equal(brackets.parse('@supports not (a:b)) {}'), [
    '@supports not ',
    ['a:b'],
    ') {}'
  ])
})

test('stringifies simple string', () => {
  equal(brackets.stringify(['test']), 'test')
})

test('stringifies brackets', () => {
  equal(brackets.stringify(['a ', ['b'], ' a']), 'a (b) a')
})

test('stringifies many brackets', () => {
  equal(brackets.stringify(['a ', ['b ', [''], ''], ' a']), 'a (b ()) a')
})

test.run()
