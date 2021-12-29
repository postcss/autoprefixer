let { test } = require('uvu')
let { is } = require('uvu/assert')

let OldValue = require('../lib/old-value')

test('checks value in string', () => {
  let old = new OldValue('calc', '-o-calc')
  is(old.check('1px -o-calc(1px)'), true)
  is(old.check('1px calc(1px)'), false)
})

test('allows custom checks', () => {
  let old = new OldValue('calc', '-o-calc', 'calc', /calc/)
  is(old.check('1px calc(1px)'), true)
})

test.run()
