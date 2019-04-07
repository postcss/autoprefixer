let parse = require('postcss').parse

let AtRule = require('../lib/at-rule')

describe('process()', () => {
  it('adds prefixes', () => {
    let keyframes = new AtRule('@keyframes', ['-moz-', '-ms-'])

    let css = parse('@-moz-keyframes b {} ' +
                    '@-ms-keyframes a {} ' +
                    '@keyframes a {}')
    keyframes.process(css.last)
    expect(css.toString()).toEqual('@-moz-keyframes b {} ' +
                                   '@-ms-keyframes a {} ' +
                                   '@-moz-keyframes a {} ' +
                                   '@keyframes a {}')
  })
})
