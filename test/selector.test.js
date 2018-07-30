let Selector = require('../lib/selector')
let parse = require('postcss').parse

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
    expect(regexp.test('::-moz-selection')).toBeTruthy()
    expect(regexp.test('::selection')).toBeFalsy()
  })

  it('creates regexp without prefix', () => {
    let regexp = selector.regexp()
    expect(regexp.test('::-moz-selection')).toBeFalsy()
    expect(regexp.test('::selection')).toBeTruthy()
  })
})

describe('check()', () => {
  it('shecks rule selectors', () => {
    let css = parse('body .selection {}, ' +
            ':::selection {}, body ::selection {}')
    expect(selector.check(css.nodes[0])).toBeFalsy()
    expect(selector.check(css.nodes[1])).toBeFalsy()
    expect(selector.check(css.nodes[2])).toBeTruthy()
  })
})

describe('prefixeds()', () => {
  it('returns all avaiable prefixed selectors', () => {
    let css = parse('::selection {}')
    expect(selector.prefixeds(css.first)).toEqual({
      '-webkit-': '::-webkit-selection',
      '-moz-': '::-moz-selection',
      '-ms-': '::-ms-selection',
      '-o-': '::-o-selection' })
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
    expect(selector.already(css.first, prefixeds, '-moz-'))
      .toBeFalsy()
  })

  it('stops on another type', () => {
    let css = parse('::-moz-selection {} ' +
            '@keyframes anim {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-'))
      .toBeFalsy()
  })

  it('stops on another selector', () => {
    let css = parse('::-moz-selection {} a {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-'))
      .toBeFalsy()
  })

  it('finds prefixed even if unknown prefix is between', () => {
    let css = parse('::-moz-selection {} ' +
            '::-o-selection {} ::selection {}')
    expect(selector.already(css.nodes[2], prefixeds, '-moz-'))
      .toBeTruthy()
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
