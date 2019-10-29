let parse = require('postcss').parse

let Declaration = require('../lib/declaration')
let Prefixes = require('../lib/prefixes')

let prefixes, tabsize
beforeEach(() => {
  prefixes = new Prefixes({ }, { })
  tabsize = new Declaration('tab-size', ['-moz-', '-ms-'], prefixes)
})

describe('otherPrefixes()', () => {
  it('checks values for other prefixes', () => {
    expect(tabsize.otherPrefixes('black', '-moz-')).toBe(false)
    expect(tabsize.otherPrefixes('-moz-black', '-moz-')).toBe(false)
    expect(tabsize.otherPrefixes('-dev-black', '-moz-')).toBe(false)
    expect(tabsize.otherPrefixes('-ms-black', '-moz-')).toBe(true)
  })
})

describe('needCascade()', () => {
  afterAll(() => {
    delete prefixes.options.cascade
  })

  it('returns true by default', () => {
    let css = parse('a {\n  tab-size: 4 }')
    expect(tabsize.needCascade(css.first.first)).toBe(true)
  })

  it('return false is disabled', () => {
    prefixes.options.cascade = false
    let css = parse('a {\n  tab-size: 4 }')
    expect(tabsize.needCascade(css.first.first)).toBe(false)
  })

  it('returns false on declarations in one line', () => {
    let css = parse('a { tab-size: 4 } a {\n  tab-size: 4 }')
    expect(tabsize.needCascade(css.first.first)).toBe(false)
    expect(tabsize.needCascade(css.last.first)).toBe(true)
  })
})

describe('maxPrefixed()', () => {
  it('returns max prefix length', () => {
    let decl = parse('a { tab-size: 4 }').first.first
    let list = ['-webkit-', '-webkit- old', '-moz-']
    expect(tabsize.maxPrefixed(list, decl)).toEqual(8)
  })
})

describe('calcBefore()', () => {
  it('returns before with cascade', () => {
    let decl = parse('a { tab-size: 4 }').first.first
    let list = ['-webkit-', '-moz- old', '-moz-']
    expect(tabsize.calcBefore(list, decl, '-moz- old')).toEqual('    ')
  })
})

describe('restoreBefore()', () => {
  it('removes cascade', () => {
    let css = parse('a {\n' +
                           '  -moz-tab-size: 4;\n' +
                           '       tab-size: 4 }')
    let decl = css.first.nodes[1]
    tabsize.restoreBefore(decl)
    expect(decl.raws.before).toEqual('\n  ')
  })
})

describe('prefixed()', () => {
  it('returns prefixed property', () => {
    let css = parse('a { tab-size: 2 }')
    let decl = css.first.first
    expect(tabsize.prefixed(decl.prop, '-moz-')).toEqual('-moz-tab-size')
  })
})

describe('normalize()', () => {
  it('returns property name by specification', () => {
    expect(tabsize.normalize('tab-size')).toEqual('tab-size')
  })
})

describe('process()', () => {
  it('adds prefixes', () => {
    let css = parse('a { -moz-tab-size: 2; tab-size: 2 }')
    tabsize.process(css.first.nodes[1])
    expect(css.toString()).toEqual(
      'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }')
  })

  it('checks parents prefix', () => {
    let css = parse('::-moz-selection a { tab-size: 2 }')
    tabsize.process(css.first.first)
    expect(css.toString()).toEqual(
      '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }')
  })

  it('checks value for prefixes', () => {
    let css = parse('a { tab-size: -ms-calc(2) }')
    tabsize.process(css.first.first)
    expect(css.toString()).toEqual(
      'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }')
  })
})

describe('old()', () => {
  it('returns list of prefixeds', () => {
    expect(tabsize.old('tab-size', '-moz-')).toEqual(['-moz-tab-size'])
  })
})
