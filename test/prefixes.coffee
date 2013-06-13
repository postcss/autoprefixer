Prefixes = require('../lib/autoprefixer/prefixes')
Browsers = require('../lib/autoprefixer/browsers')
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

    it 'should select necessary prefixes', ->
      fill.select(data.prefixes).should.eql
        add:
          a: ['-moz-']
          b: ['-ms-']
        remove:
          a: ['-webkit-', '-ms-']
          b: ['-moz-']

  describe 'preprocess()', ->

    it 'should preprocess prefixes data', ->
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

      fill.remove.should.eql
        'transition':
          values: [utils.regexp('-webkit-a'), utils.regexp('-ms-a')]
        'transition-property':
          values: [utils.regexp('-webkit-a'), utils.regexp('-ms-a')]
        '-webkit-a':
          remove: true
        '-ms-a':
          remove: true
        'a':
          values: [utils.regexp('-moz-b')]
        '*':
          values: [utils.regexp('-moz-b')]

  describe 'other()', ->

    it 'should return prefixes', ->
      empty.other('-moz-').should.eql ['-webkit-', '-ms-']

  describe 'each()', ->

    it 'should iterate all prefixes to add', ->
      all = []
      fill.each('a', (i) -> all.push(i) )
      all.should.eql ['-moz-']

    it 'should not iterate if prefixes in unnecessary', ->
      all = []
      fill.each('c', (i) -> all.push(i) )
      all.should.eql []

  describe 'values()', ->

    it 'should return values for this and all properties', ->
      fill.values('add', 'a').should.eql [
        { name: 'b', prefixes: ['-ms-'], regexp: utils.regexp('b') }
      ]
      fill.values('remove', 'a').should.eql [
        utils.regexp('-moz-b')
      ]

  describe 'toRemove()', ->

    it 'should return true if we need to remove this property', ->
      (!!fill.toRemove('-ms-a')).should.be.true
      (!!fill.toRemove('a')).should.be.false
