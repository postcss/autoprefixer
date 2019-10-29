let parse = require('postcss').parse

let Selector = require('../lib/selector')

let selector
beforeEach(() => {
  selector = new Selector('::selection', ['-moz-', '-ms-'])
})

describe('prefixed()', () => {
  it('adds prefix after non-letters symbols', () => {
    expect(selector.prefixed('-moz-')).toEqual('::-moz-selection')
  })
})

describe('regexp()', () => {
  it('creates regexp for prefix', () => {
    let regexp = selector.regexp('-moz-')
    expect(regexp.test('::-moz-selection')).toBe(true)
    expect(regexp.test('::selection')).toBe(false)
  })

  it('creates regexp without prefix', () => {
    let regexp = selector.regexp()
    expect(regexp.test('::-moz-selection')).toBe(false)
    expect(regexp.test('::selection')).toBe(true)
  })
})

describe('check()', () => {
  it('checks rule selectors', () => {
    let css = parse('body .selection {}, ' +
            ':::selection {}, body ::selection {}')
    expect(selector.check(css.nodes[0])).toBe(false)
    expect(selector.check(css.nodes[1])).toBe(false)
    expect(selector.check(css.nodes[2])).toBe(true)
  })
})

describe('prefixeds()', () => {
  it('grouping rule gets correct _autoprefixerPrefixeds property', () => {
    let css = parse('.c::selection, .d:read-only {}')
    let rSel = new Selector(':read-only', ['-moz-'])
    selector.prefixeds(css.first)
    rSel.prefixeds(css.first)
    expect(css.first._autoprefixerPrefixeds).toEqual({
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

  it('returns all available prefixed selectors', () => {
    let css = parse('::selection {}')
    expect(selector.prefixeds(css.first)).toEqual({
      '::selection': {
        '-webkit-': '::-webkit-selection',
        '-moz-': '::-moz-selection',
        '-ms-': '::-ms-selection',
        '-o-': '::-o-selection'
      }
    })
  })
})

describe('already()', () => {
  let prefixeds
  beforeEach(() => {
    let css = parse('::selection {}')
    prefixeds = selector.prefixeds(css.first)
  })

  it('returns false on first element', () => {
    let css = parse('::selection {}')
    expect(selector.already(css.first, prefixeds, '-moz-')).toBe(false)
  })

  it('stops on another type', () => {
    let css = parse('::-moz-selection {} ' +
            '@keyframes anim {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-')).toBe(false)
  })

  it('stops on another selector', () => {
    let css = parse('::-moz-selection {} a {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-')).toBe(false)
  })

  it('finds prefixed even if unknown prefix is between', () => {
    let css = parse('::-moz-selection {} ' +
            '::-o-selection {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-')).toBe(true)
  })
})

describe('replace()', () => {
  it('adds prefix to selectors', () => {
    expect(
      selector.replace('body ::selection, input::selection, a', '-ms-')
    ).toEqual('body ::-ms-selection, input::-ms-selection, a')
  })
})

describe('process()', () => {
  it('adds prefixes', () => {
    let css = parse('b ::-moz-selection{} b ::selection{}')
    selector.process(css.nodes[1])
    expect(css.toString()).toEqual(
      'b ::-moz-selection{} b ::-ms-selection{} b ::selection{}')
  })

  it('checks parents prefix', () => {
    let css = parse('@-moz-page{ ::selection{} }')
    selector.process(css.first.first)
    expect(css.toString()).toEqual(
      '@-moz-page{ ::-moz-selection{} ::selection{} }')
  })
})

describe('old()', () => {
  it('returns object to find old selector', () => {
    let old = selector.old('-moz-')
    expect(old.unprefixed).toEqual('::selection')
    expect(old.prefix).toEqual('-moz-')
  })
})
