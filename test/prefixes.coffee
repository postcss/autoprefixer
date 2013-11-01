Prefixes = require('../lib/autoprefixer/prefixes')
Browsers = require('../lib/autoprefixer/browsers')
Selector = require('../lib/autoprefixer/selector')
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
      browsers: ['ie 2 new', 'ff 1']
      mistakes: ['-webkit-']
      props:    ['a', '*']
    c:
      browsers: ['ie 2', 'ff 1']
      selector: true

empty = new Prefixes({ }, new Browsers(data.browsers, []))
fill  = new Prefixes(data.prefixes,
                     new Browsers(data.browsers, ['ff 2', 'ie 2']))

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
          a: ['-webkit-', '-ms-']
          b: ['-ms-', '-moz-', '-webkit-']
          c: ['-moz-']

  describe 'preprocess()', ->

    it 'preprocesses prefixes data', ->
      fill.add.should.eql
        'selectors': [new Selector('c', ['-ms-'])]
        'transition':
          values: [name: 'a', prefixes: ['-moz-'], regexp: utils.regexp('a')]
        'transition-property':
          values: [name: 'a', prefixes: ['-moz-'], regexp: utils.regexp('a')]
        'a':
          prefixes: ['-moz-']
          values: [name: 'b', prefixes: ['-ms- new'], regexp: utils.regexp('b')]
        '*':
          values: [name: 'b', prefixes: ['-ms- new'], regexp: utils.regexp('b')]

      JSON.stringify(fill.remove).should.eql JSON.stringify({
        'selectors': ['-moz-c']
        'transition':
          values: [old('-webkit-a'), old('-ms-a')]
        'transition-property':
          values: [old('-webkit-a'), old('-ms-a')]
        '-webkit-a':
          remove: true
        '-ms-a':
          remove: true
        'a':
          values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
        '*':
          values: [old('-ms-b'), old('-moz-b'), old('-webkit-b')]
      })

  describe 'other()', ->

    it 'returns prefixes', ->
      empty.other('-moz-').should.eql ['-webkit-', '-ms-']

  describe 'isCustom()', ->

    it 'returns true browser prefixes', ->
      fill.isCustom('-moz-').should.be.false
      fill.isCustom('-evil-').should.be.true

  describe 'values()', ->

    it 'returns values for this and all properties', ->
      fill.values('add', 'a').should.eql [
        { name: 'b', prefixes: ['-ms- new'], regexp: utils.regexp('b') }
      ]

      fill.values('remove', 'a').should.eql [old('-ms-b'),
                                             old('-moz-b'),
                                             old('-webkit-b')]
