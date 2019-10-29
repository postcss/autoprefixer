let utils = require('../lib/utils')

describe('.error()', () => {
  it('raises an error', () => {
    expect(() => {
      utils.error('A')
    }).toThrow('A')
  })

  it('marks an error', () => {
    let error = null
    try {
      utils.error('A')
    } catch (e) {
      error = e
    }

    expect(error.autoprefixer).toBe(true)
  })
})

describe('.uniq()', () => {
  it('filters doubles in array', () => {
    expect(utils.uniq(['1', '1', '2', '3', '3']))
      .toEqual(['1', '2', '3'])
  })
})

describe('.removeNote()', () => {
  it('removes note', () => {
    expect(utils.removeNote('-webkit- note')).toEqual('-webkit-')
    expect(utils.removeNote('-webkit-')).toEqual('-webkit-')
  })
})

describe('.escapeRegexp()', () => {
  it('escapes RegExp symbols', () => {
    let string = utils.escapeRegexp('^[()\\]')
    expect(string).toEqual('\\^\\[\\(\\)\\\\\\]')
  })
})

describe('.regexp()', () => {
  it('generates RegExp that finds tokens in CSS values', () => {
    let regexp = utils.regexp('foo')
    function check (string) {
      return string.match(regexp) !== null
    }

    expect(check('foo')).toBe(true)
    expect(check('Foo')).toBe(true)
    expect(check('one, foo, two')).toBe(true)
    expect(check('one(),foo(),two()')).toBe(true)

    expect('foo(), a, foo'.replace(regexp, '$1b$2'))
      .toEqual('bfoo(), a, bfoo')

    expect(check('foob')).toBe(false)
    expect(check('(foo)')).toBe(false)
    expect(check('-a-foo')).toBe(false)
  })

  it('escapes string if needed', () => {
    let regexp = utils.regexp('(a|b)')
    function check (string) {
      return string.match(regexp) !== null
    }

    expect(check('a')).toBe(false)
    expect(check('(a|b)')).toBe(true)

    regexp = utils.regexp('(a|b)', false)
    expect(check('a')).toBe(true)
    expect(check('b')).toBe(true)
  })
})

describe('.editList()', () => {
  it('does save without changes', () => {
    let list = utils.editList('a,\nb, c', parsed => parsed)
    expect(list).toEqual('a,\nb, c')
  })

  it('changes list', () => {
    let list = utils.editList('a, b', (parsed, edit) => {
      expect(parsed).toEqual(['a', 'b'])
      expect(edit).toEqual([])
      return ['1', '2']
    })
    expect(list).toEqual('1, 2')
  })

  it('saves comma', () => {
    let list = utils.editList('a,\nb', () => ['1', '2'])
    expect(list).toEqual('1,\n2')
  })

  it('parse one value', () => {
    let list = utils.editList('1', parsed => [parsed[0], '2'])
    expect(list).toEqual('1, 2')
  })
})

describe('.splitSelector()', () => {
  it('splits simple selectors into an array', () => {
    let arr1 = utils.splitSelector('#foo.bar')
    let arr2 = utils.splitSelector('.foo, .bar')
    expect(arr1).toEqual([
      [
        ['#foo', '.bar']
      ]
    ])
    expect(arr2).toEqual([
      [['.foo']],
      [['.bar']]
    ])
  })

  it('splits complex selectors into an array', () => {
    let arr = utils.splitSelector(
      '#foo.bar .child-one.mod .child-two.mod, .baz, .hello'
    )
    expect(arr).toEqual([
      [
        ['#foo', '.bar'],
        ['.child-one', '.mod'],
        ['.child-two', '.mod']
      ],
      [
        ['.baz']
      ],
      [
        ['.hello']
      ]
    ])
  })
})
