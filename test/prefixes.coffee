Declaration = require('../lib/autoprefixer/declaration')
Prefixes    = require('../lib/autoprefixer/prefixes')
Browsers    = require('../lib/autoprefixer/browsers')
Selector    = require('../lib/autoprefixer/selector')
OldValue    = require('../lib/autoprefixer/old-value')
Value       = require('../lib/autoprefixer/value')

data =
  browsers:
    chrome:
      prefix:   '-webkit-'
      versions: ['chrome 1']
    ff:
      prefix:   '-moz-'
      versions: ['ff 2', 'ff 1']
    ie:
      prefix:   '-ms-'
      versions: ['ie 2', 'ie 1']
  prefixes:
    a:
      browsers: ['ff 2', 'ff 1 old', 'chrome 1', 'ie 1']
      transition: true
    b:
      browsers: ['ie 2 new', 'ff 1']
      mistakes: ['-webkit-']
      props:    ['a', '*']
    c:
      browsers: ['ie 2', 'ff 1']
      selector: true

empty = new Prefixes({ }, new Browsers(data.browsers, []))
fill  = new Prefixes(data.prefixes,
                     new Browsers(data.browsers, ['ff 2', 'ie 2']))

cSel  = new Selector('c', ['-ms-'])
aVal  = new Value('a', ['-moz-'])
bVal  = new Value('b', ['-ms- new'])
aProp = new Declaration('a', ['-moz-'])
aProp.values = [bVal]

old = (name) -> new OldValue(name)

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
        'transition':
          values: [aVal]
        'transition-property':
          values: [aVal]
        'a': aProp
        '*':
          values: [bVal]

    it 'preprocesses prefixes remove data', ->

      JSON.stringify(fill.remove).should.eql JSON.stringify({
        'selectors': ['-moz-c']
        'transition':
          values: [old('-webkit-a'), old('-ms-a'), old('-moz- olda')]
        'transition-property':
          values: [old('-webkit-a'), old('-ms-a'), old('-moz- olda')]
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
