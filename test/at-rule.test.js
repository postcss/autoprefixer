let { equal } = require('uvu/assert')
let { parse } = require('postcss')
let { test } = require('uvu')

let AtRule = require('../lib/at-rule')

test('adds prefixes', () => {
  let keyframes = new AtRule('@keyframes', ['-moz-', '-ms-'])

  let css = parse(
    '@-moz-keyframes b {} ' + '@-ms-keyframes a {} ' + '@keyframes a {}'
  )
  keyframes.process(css.last)
  equal(
    css.toString(),
    '@-moz-keyframes b {} ' +
      '@-ms-keyframes a {} ' +
      '@-moz-keyframes a {} ' +
      '@keyframes a {}'
  )
})

test.run()
