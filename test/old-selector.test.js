let parse = require('postcss').parse

let Selector = require('../lib/selector')

let selector = new Selector('::selection', ['-moz-', '-ms-'])
let old = selector.old('-moz-')

describe('isHack()', () => {
  it('returns true on last rule', () => {
    let css = parse('::selection {} ::-moz-selection {}')
    expect(old.isHack(css.last)).toBe(true)
  })

  it('stops on another type', () => {
    let css = parse('::-moz-selection {} ' +
                          '@keyframes anim {} ::selection {}')
    expect(old.isHack(css.first)).toBe(true)
  })

  it('stops on another selector', () => {
    let css = parse('::-moz-selection {} a {} ::selection {}')
    expect(old.isHack(css.first)).toBe(true)
  })

  it('finds unprefixed selector', () => {
    let css = parse('::-moz-selection {} ' +
                          '::-o-selection {} ::selection {}')
    expect(old.isHack(css.first)).toBe(false)
  })
})

describe('check()', () => {
  it('finds old selector', () => {
    let css = parse('body::-moz-selection {} body::selection {}')
    expect(old.check(css.first)).toBe(true)
  })

  it('finds right', () => {
    let css = parse('body:::-moz-selection {}')
    expect(old.check(css.first)).toBe(false)
  })
})
