let parse = require('postcss').parse

let Selector = require('../lib/selector')

let selector = new Selector('::selection', ['-moz-', '-ms-'])
let old = selector.old('-moz-')

describe('isHack()', () => {
  it('returns true on last rule', () => {
    let css = parse('::selection {} ::-moz-selection {}')
    expect(old.isHack(css.last)).toBeTruthy()
  })

  it('stops on another type', () => {
    let css = parse('::-moz-selection {} ' +
                          '@keyframes anim {} ::selection {}')
    expect(old.isHack(css.first)).toBeTruthy()
  })

  it('stops on another selector', () => {
    let css = parse('::-moz-selection {} a {} ::selection {}')
    expect(old.isHack(css.first)).toBeTruthy()
  })

  it('finds unprefixed selector', () => {
    let css = parse('::-moz-selection {} ' +
                          '::-o-selection {} ::selection {}')
    expect(old.isHack(css.first)).toBeFalsy()
  })
})

describe('check()', () => {
  it('finds old selector', () => {
    let css = parse('body::-moz-selection {} body::selection {}')
    expect(old.check(css.first)).toBeTruthy()
  })

  it('finds right', () => {
    let css = parse('body:::-moz-selection {}')
    expect(old.check(css.first)).toBeFalsy()
  })
})
