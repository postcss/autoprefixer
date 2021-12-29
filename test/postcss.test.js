let { equal } = require('uvu/assert')
let { test } = require('uvu')
let postcss = require('postcss')

let autoprefixer = require('..')

test('works with other PostCSS plugins', () => {
  let plugin = () => {
    return {
      postcssPlugin: 'test',
      Rule(rule) {
        rule.selector = 'b'
      },
      AtRule: {
        mixin: (atRule, { Declaration }) => {
          atRule.replaceWith(
            new Declaration({ prop: 'user-select', value: 'none' })
          )
        }
      }
    }
  }
  plugin.postcss = true

  let result = postcss([
    plugin(),
    autoprefixer({ overrideBrowserslist: 'chrome 40' })
  ]).process('a{ @mixin; }', {
    from: 'a.css'
  })

  equal(result.css, 'b{ -webkit-user-select: none; user-select: none; }')
})

test.run()
