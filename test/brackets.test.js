let { equal } = require('uvu/assert')
let { test } = require('uvu')

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
