let parse = require('postcss').parse

let Prefixer = require('../lib/prefixer')

let prefix, css
beforeEach(() => {
  prefix = new Prefixer()
  css = parse(
    '@-ms-keyframes a { to { } } ' +
      ':-moz-full-screen { } a { } ' +
      '@-dev-keyframes s { to { } }'
  )
})

describe('.hack()', () => {
  it('registers hacks for subclasses', () => {
    class A extends Prefixer {}
    class Hack extends A {}
    Hack.names = ['a', 'b']

    A.hack(Hack)

    expect(A.hacks).toEqual({ a: Hack, b: Hack })
    expect(Prefixer.hacks).toBeUndefined()
  })
})

describe('.load()', () => {
  it('loads hacks', () => {
    class A extends Prefixer {
      constructor() {
        super()
        this.klass = 'a'
      }
    }
    class Hack extends A {
      constructor() {
        super()
        this.klass = 'hack'
      }
    }
    A.hacks = { hacked: Hack }

    expect(A.load('hacked').klass).toBe('hack')
    expect(A.load('a').klass).toBe('a')
  })
})

describe('.clone()', () => {
  it('cleans custom properties', () => {
    let rule = css.first.first
    rule._autoprefixerPrefix = '-ms-'
    rule._autoprefixerValues = { '-ms-': 1 }

    let cloned = Prefixer.clone(rule, { selector: 'from' })
    expect(cloned.selector).toBe('from')

    expect(cloned._autoprefixerPrefix).toBeUndefined()
    expect(cloned._autoprefixerValues).toBeUndefined()
  })

  it('fixed declaration between', () => {
    let parsed = parse('a { color : black }')
    let cloned = Prefixer.clone(parsed.first.first)
    expect(cloned.raws.between).toBe(' : ')
  })
})

describe('parentPrefix', () => {
  it('works with root node', () => {
    expect(prefix.parentPrefix(css)).toBe(false)
  })

  it('finds in at-rules', () => {
    expect(prefix.parentPrefix(css.first)).toBe('-ms-')
  })

  it('finds in selectors', () => {
    expect(prefix.parentPrefix(css.nodes[1])).toBe('-moz-')
  })

  it('finds in parents', () => {
    let decl = css.first.first
    expect(prefix.parentPrefix(decl)).toBe('-ms-')
    expect(prefix.parentPrefix(css.nodes[2])).toBe(false)
  })

  it('caches prefix', () => {
    prefix.parentPrefix(css.first)
    expect(css.first._autoprefixerPrefix).toBe('-ms-')

    css.first._autoprefixerPrefix = false
    expect(prefix.parentPrefix(css.first)).toBe(false)
  })

  it('finds only browsers prefixes', () => {
    expect(prefix.parentPrefix(css.nodes[2])).toBe(false)
  })

  it('works with selector contained --', () => {
    let parsed = parse(':--a { color: black }')
    expect(prefix.parentPrefix(parsed.first.first)).toBe(false)
  })
})
