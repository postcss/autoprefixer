let { equal, is, throws } = require('uvu/assert')
let { test } = require('uvu')

let utils = require('../lib/utils')

test('raises an error', () => {
  throws(() => {
    utils.error('A')
  }, 'A')
})

test('marks an error', () => {
  let error = null
  try {
    utils.error('A')
  } catch (e) {
    error = e
  }

  is(error.autoprefixer, true)
})

test('filters doubles in array', () => {
  equal(utils.uniq(['1', '1', '2', '3', '3']), ['1', '2', '3'])
})

test('removes note', () => {
  equal(utils.removeNote('-webkit- note'), '-webkit-')
  equal(utils.removeNote('-webkit-'), '-webkit-')
})

test('escapes RegExp symbols', () => {
  equal(utils.escapeRegexp('^[()\\]'), '\\^\\[\\(\\)\\\\\\]')
})

test('generates RegExp that finds tokens in CSS values', () => {
  let regexp = utils.regexp('foo')
  function check(string) {
    return string.match(regexp) !== null
  }

  is(check('foo'), true)
  is(check('Foo'), true)
  is(check('one, foo, two'), true)
  is(check('one(),foo(),two()'), true)

  equal('foo(), a, foo'.replace(regexp, '$1b$2'), 'bfoo(), a, bfoo')

  is(check('foob'), false)
  is(check('(foo)'), false)
  is(check('-a-foo'), false)
})

test('escapes string if needed', () => {
  let regexp = utils.regexp('(a|b)')
  function check(string) {
    return string.match(regexp) !== null
  }

  is(check('a'), false)
  is(check('(a|b)'), true)

  regexp = utils.regexp('(a|b)', false)
  is(check('a'), true)
  is(check('b'), true)
})

test('does save without changes', () => {
  let list = utils.editList('a,\nb, c', parsed => parsed)
  equal(list, 'a,\nb, c')
})

test('changes list', () => {
  let list = utils.editList('a, b', (parsed, edit) => {
    equal(parsed, ['a', 'b'])
    equal(edit, [])
    return ['1', '2']
  })
  equal(list, '1, 2')
})

test('saves comma', () => {
  let list = utils.editList('a,\nb', () => ['1', '2'])
  equal(list, '1,\n2')
})

test('parse one value', () => {
  let list = utils.editList('1', parsed => [parsed[0], '2'])
  equal(list, '1, 2')
})

test('splits simple selectors into an array', () => {
  let arr1 = utils.splitSelector('#foo.bar')
  let arr2 = utils.splitSelector('.foo, .bar')
  equal(arr1, [[['#foo', '.bar']]])
  equal(arr2, [[['.foo']], [['.bar']]])
})

test('splits complex selectors into an array', () => {
  let arr = utils.splitSelector(
    '#foo.bar .child-one.mod .child-two.mod, .baz, .hello'
  )
  equal(arr, [
    [
      ['#foo', '.bar'],
      ['.child-one', '.mod'],
      ['.child-two', '.mod']
    ],
    [['.baz']],
    [['.hello']]
  ])
})

test.run()
