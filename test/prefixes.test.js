let { equal, is } = require('uvu/assert')
let { agents } = require('caniuse-lite')
let { parse } = require('postcss')
let { test } = require('uvu')

let Declaration = require('../lib/declaration')
let Prefixes = require('../lib/prefixes')
let Browsers = require('../lib/browsers')
let Supports = require('../lib/supports')
let Selector = require('../lib/selector')
let OldValue = require('../lib/old-value')
let Value = require('../lib/value')

let data = {
  browsers: agents,
  prefixes: {
    a: {
      browsers: ['firefox 21', 'firefox 20 old', 'chrome 30', 'ie 6']
    },
    b: {
      browsers: ['ie 7 new', 'firefox 20'],
      mistakes: ['-webkit-'],
      props: ['a', '*']
    },
    c: {
      browsers: ['ie 7', 'firefox 20'],
      selector: true
    }
  }
}

let empty = new Prefixes({}, new Browsers(data.browsers, []))
let fill = new Prefixes(
  data.prefixes,
  new Browsers(data.browsers, ['firefox 21', 'ie 7'])
)

let cSel = new Selector('c', ['-ms-'], fill)
let bVal = new Value('b', ['-ms- new'], fill)
let aProp = new Declaration('a', ['-moz-'], fill)
aProp.values = [bVal]

function old(prefixed) {
  let name = prefixed.replace(/-[^-]+-( old)?/, '')
  return new OldValue(name, prefixed)
}

test('selects necessary prefixes', () => {
  equal(fill.select(data.prefixes), {
    add: {
      a: ['-moz-'],
      b: ['-ms- new'],
      c: ['-ms-']
    },
    remove: {
      a: ['-webkit-', '-ms-', '-moz- old'],
      b: ['-ms-', '-moz-', '-webkit-'],
      c: ['-moz-']
    }
  })
})

test('preprocesses prefixes add data', () => {
  equal(fill.add, {
    'selectors': [cSel],
    'a': aProp,
    '*': {
      values: [bVal]
    },
    '@supports': new Supports(Prefixes, fill)
  })
})

test('preprocesses prefixes remove data', () => {
  equal(
    JSON.stringify(fill.remove),
    JSON.stringify({
      'selectors': [cSel.old('-moz-')],
      '-webkit-a': {
        remove: true
      },
      '-ms-a': {
        remove: true
      },
      '-moz- olda': {
        remove: true
      },
      'a': {
        values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
      },
      '*': {
        values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
      }
    })
  )
})

test('returns itself is no browsers are selected', () => {
  equal(empty.cleaner(), empty)
})

test('returns Prefixes with empty browsers', () => {
  let cleaner = new Prefixes(data.prefixes, new Browsers(data.browsers, []))
  equal(Object.keys(fill.cleaner().add).length, 2)
  equal(fill.cleaner().remove, cleaner.remove)
})

test('loads declarations by property', () => {
  equal(empty.decl('a'), new Declaration('a'))
})

test('caches values', () => {
  equal(empty.decl('a'), empty.decl('a'))
})

test('returns unprefixed version', () => {
  equal(empty.unprefixed('-moz-a'), 'a')
})

test('adds prefix', () => {
  equal(empty.prefixed('a', '-ms-'), '-ms-a')
})

test('changes prefix', () => {
  equal(empty.prefixed('a', '-ms-'), '-ms-a')
})

test('returns values for this and all properties', () => {
  equal(fill.values('add', 'a'), [bVal])
  equal(fill.values('remove', 'a'), [
    old('-ms-b'),
    old('-moz-b'),
    old('-webkit-b')
  ])
})

test('checks prefix group', () => {
  let css = parse('a { -ms-a: 1; -o-a: 1; a: 1; b: 2 }')
  let props = []

  empty.group(css.first.first).down(i => props.push(i.prop))
  equal(props, ['-o-a', 'a'])
})

test('checks prefix groups', () => {
  let css = parse('a { -ms-a: 1; -o-a: 1; ' + 'a: -o-calc(1); a: 1; a: 2 }')
  let props = []

  empty.group(css.first.first).down(i => props.push(i.prop))
  equal(props, ['-o-a', 'a', 'a'])
})

test('returns check decls inside group', () => {
  let css = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }')
  let decl = css.first.first

  is(
    empty.group(decl).down(i => i.prop === '-o-a'),
    true
  )
  is(
    empty.group(decl).down(i => i.prop === '-o-b'),
    false
  )
})

test('checks prefix group', () => {
  let css = parse('a { b: 2; -ms-a: 1; -o-a: 1; a: 1 }')
  let props = []

  empty.group(css.first.nodes[3]).up(i => props.push(i.prop))
  equal(props, ['-o-a', '-ms-a'])
})

test('checks prefix groups', () => {
  let css = parse('a { a: 2; -ms-a: 1; ' + '-o-a: 1; a: -o-calc(1); a: 1  }')
  let props = []

  empty.group(css.first.nodes[4]).up(i => props.push(i.prop))
  equal(props, ['a', '-o-a', '-ms-a'])
})

test('returns check decls inside group', () => {
  let css = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }')
  let decl = css.first.nodes[3]

  is(
    empty.group(decl).up(i => i.prop === '-ms-a'),
    true
  )
  is(
    empty.group(decl).up(i => i.prop === '-ms-b'),
    false
  )
})

test.run()
