Prefixes = require('../lib/autoprefixer/prefixes')
Browsers = require('../lib/autoprefixer/browsers')
OldValue = require('../lib/autoprefixer/old-value')
Value    = require('../lib/autoprefixer/value')
utils    = require('../lib/autoprefixer/utils')

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
      browsers: ['ff 2', 'ff 1', 'chrome 1', 'ie 1']
      transition: true
    b:
      browsers: ['ie 2', 'ff 1']
      props:    ['a', '*']
empty = new Prefixes({ }, new Browsers(data.browsers, []))
fill  = new Prefixes(data.prefixes,
                     new Browsers(data.browsers, ['ff 2', 'ie 2']))

describe 'Prefixes', ->

  describe 'select()', ->

    it 'selects necessary prefixes', ->
      fill.select(data.prefixes).should.eql
        add:
          a: ['-moz-']
          b: ['-ms-']
        remove:
          a: ['-webkit-', '-ms-']
          b: ['-moz-']

  describe 'preprocess()', ->

    it 'preprocesses prefixes data', ->
      fill.add.should.eql
        'transition':
          values: [name: 'a', prefixes: ['-moz-'], regexp: utils.regexp('a')]
        'transition-property':
          values: [name: 'a', prefixes: ['-moz-'], regexp: utils.regexp('a')]
        'a':
          prefixes: ['-moz-']
          values: [name: 'b', prefixes: ['-ms-'], regexp: utils.regexp('b')]
        '*':
          values: [name: 'b', prefixes: ['-ms-'], regexp: utils.regexp('b')]

      JSON.stringify(fill.remove).should.eql JSON.stringify({
        'transition':
          values: [new OldValue('-webkit-a'), new OldValue('-ms-a')]
        'transition-property':
          values: [new OldValue('-webkit-a'), new OldValue('-ms-a')]
        '-webkit-a':
          remove: true
        '-ms-a':
          remove: true
        'a':
          values: [new OldValue('-moz-b')]
        '*':
          values: [new OldValue('-moz-b')]
      })

  describe 'other()', ->

    it 'returns prefixes', ->
      empty.other('-moz-').should.eql ['-webkit-', '-ms-']

  describe 'each()', ->

    it 'iterates all prefixes for addition', ->
      all = []
      fill.each('a', (i) -> all.push(i) )
      all.should.eql ['-moz-']

    it "doesn't iterate if prefixes are unnecessary", ->
      all = []
      fill.each('c', (i) -> all.push(i) )
      all.should.eql []

  describe 'values()', ->

    it 'returns values for this and all properties', ->
      fill.values('add', 'a').should.eql [
        { name: 'b', prefixes: ['-ms-'], regexp: utils.regexp('b') }
      ]

      fill.values('remove', 'a').should.eql [new OldValue('-moz-b')]

  describe 'toRemove()', ->

    it 'returns true property needs to be removed', ->
      (!!fill.toRemove('-ms-a')).should.be.true
      (!!fill.toRemove('a')).should.be.false
