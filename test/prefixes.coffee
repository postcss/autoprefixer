Declaration = require('../lib/declaration')
Prefixes    = require('../lib/prefixes')
Browsers    = require('../lib/browsers')
Supports    = require('../lib/supports')
Selector    = require('../lib/selector')
OldValue    = require('../lib/old-value')
Value       = require('../lib/value')
parse       = require('postcss/lib/parse')

data =
  browsers: require('caniuse-db/data.json').agents
  prefixes:
    a:
      browsers: ['firefox 21', 'firefox 20 old', 'chrome 30', 'ie 6']
    b:
      browsers: ['ie 7 new', 'firefox 20']
      mistakes: ['-webkit-']
      props:    ['a', '*']
    c:
      browsers: ['ie 7', 'firefox 20']
      selector: true

empty = new Prefixes({ }, new Browsers(data.browsers, []))
fill  = new Prefixes(data.prefixes,
                     new Browsers(data.browsers, ['firefox 21', 'ie 7']))

cSel  = new Selector('c', ['-ms-'], fill)
aVal  = new Value('a',    ['-moz-'], fill)
bVal  = new Value('b', ['-ms- new'], fill)
aProp = new Declaration('a', ['-moz-'], fill)
aProp.values = [bVal]

old = (prefixed) ->
  name = prefixed.replace(/-[^-]+-( old)?/, '')
  new OldValue(name, prefixed)

describe 'Prefixes', ->

  describe 'select()', ->

    it 'selects necessary prefixes', ->
      fill.select(data.prefixes).should.eql
        add:
          a: ['-moz-']
          b: ['-ms- new']
          c: ['-ms-']
        remove:
          a: ['-webkit-', '-ms-', '-moz- old']
          b: ['-ms-', '-moz-', '-webkit-']
          c: ['-moz-']

  describe 'preprocess()', ->

    it 'preprocesses prefixes add data', ->
      fill.add.should.eql
        'selectors': [cSel]
        'a': aProp
        '*':
          values: [bVal]
        '@supports': new Supports(Prefixes, fill)

    it 'preprocesses prefixes remove data', ->
      JSON.stringify(fill.remove).should.eql JSON.stringify({
        'selectors': [cSel.old('-moz-')]
        '-webkit-a':
          remove: true
        '-ms-a':
          remove: true
        '-moz- olda':
          remove: true
        'a':
          values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
        '*':
          values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
      })

  describe '.cleaner()', ->

    it 'returns itself is no browsers are selected', ->
      empty.cleaner().should.eql(empty)

    it 'returns Prefixes with empty browsers', ->
      cleaner = new Prefixes(data.prefixes, new Browsers(data.browsers, []))
      Object.keys(fill.cleaner().add).length.should.eql(2)
      fill.cleaner().remove.should.eql(cleaner.remove)

  describe '.decl()', ->

    it 'loads declarations by property', ->
      empty.decl('a').should.eql(new Declaration('a'))

    it 'caches values', ->
      empty.decl('a').should.exactly empty.decl('a')

  describe '.unprefixed()', ->

    it 'returns unprefixed version', ->
      empty.unprefixed('-moz-a').should.eql('a')

  describe '.prefixed()', ->

    it 'adds prefix', ->
      empty.prefixed('a', '-ms-').should.eql('-ms-a')

    it 'changes prefix', ->
      empty.prefixed('a', '-ms-').should.eql('-ms-a')

  describe 'values()', ->

    it 'returns values for this and all properties', ->
      fill.values('add', 'a').should.eql [bVal]

      fill.values('remove', 'a').should.eql [old('-ms-b'),
                                             old('-moz-b'),
                                             old('-webkit-b')]

  describe 'group()', ->

    describe 'down()', ->

      it 'checks prefix group', ->
        css   = parse('a { -ms-a: 1; -o-a: 1; a: 1; b: 2 }')
        props = []

        empty.group(css.first.first).down (i) -> props.push(i.prop)
        props.should.eql ['-o-a', 'a']

      it 'checks prefix groups', ->
        css   = parse('a { -ms-a: 1; -o-a: 1; a: -o-calc(1); a: 1; a: 2 }')
        props = []

        empty.group(css.first.first).down (i) -> props.push(i.prop)
        props.should.eql ['-o-a', 'a', 'a']

      it 'returns check decls inside group', ->
        css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }')
        decl = css.first.first

        empty.group(decl).down( (i) -> i.prop == '-o-a' ).should.be.true
        empty.group(decl).down( (i) -> i.prop == '-o-b' ).should.be.false

    describe 'up()', ->

      it 'checks prefix group', ->
        css   = parse('a { b: 2; -ms-a: 1; -o-a: 1; a: 1 }')
        props = []

        empty.group(css.first.nodes[3]).up (i) -> props.push(i.prop)
        props.should.eql ['-o-a', '-ms-a']

      it 'checks prefix groups', ->
        css   = parse('a { a: 2; -ms-a: 1; -o-a: 1; a: -o-calc(1); a: 1  }')
        props = []

        empty.group(css.first.nodes[4]).up (i) -> props.push(i.prop)
        props.should.eql ['a', '-o-a', '-ms-a']

      it 'returns check decls inside group', ->
        css  = parse('a { -moz-a: 1; -ms-a: 1; -o-a: 1; a: 1 }')
        decl = css.first.nodes[3]

        empty.group(decl).up( (i) -> i.prop == '-ms-a' ).should.be.true
        empty.group(decl).up( (i) -> i.prop == '-ms-b' ).should.be.false
