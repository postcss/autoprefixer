utils = require('../lib/utils')

describe 'utils', ->

  describe '.error()', ->

    it 'raises an error', ->
      ( -> utils.error('A') ).should.throw('A')

    it 'marks an error', ->
      error = null
      try
        utils.error('A')
      catch e
        error = e

      error.autoprefixer.should.be.true

  describe '.uniq()', ->

    it 'filters doubles in array', ->
      utils.uniq(['1', '1', '2', '3', '3']).should.eql ['1', '2', '3']

  describe '.removeNote()', ->

    it 'removes note', ->
      utils.removeNote('-webkit- note').should.eql('-webkit-')
      utils.removeNote('-webkit-').should.eql('-webkit-')

  describe '.escapeRegexp()', ->

    it 'escapes RegExp symbols', ->
      string = utils.escapeRegexp('^[()\\]')
      string.should.eql '\\^\\[\\(\\)\\\\\\]'

  describe '.regexp()', ->

    it 'generates RegExp that finds tokens in CSS values', ->
      regexp = utils.regexp('foo')
      test   = (string) -> string.match(regexp) != null

      test('foo').should.be.ok
      test('Foo').should.be.ok
      test('one, foo, two').should.be.ok
      test('one(),foo(),two()').should.be.ok

      'foo(), a, foo'.replace(regexp, '$1b$2').should.eql('bfoo(), a, bfoo')

      test('foob').should.be.false
      test('(foo)').should.be.false
      test('-a-foo').should.be.false

    it 'escapes string if needed', ->
      regexp = utils.regexp('(a|b)')
      test   = (string) -> string.match(regexp) != null

      test('a').should.be.false
      test('(a|b)').should.be.ok

      regexp = utils.regexp('(a|b)', false)
      test('a').should.be.ok
      test('b').should.be.ok

  describe '.editList()', ->

    it 'does save without changes', ->
      list = utils.editList 'a,\nb, c', (parsed, edit) -> parsed
      list.should.eql('a,\nb, c')

    it 'changes list', ->
      list = utils.editList 'a, b', (parsed, edit) ->
        parsed.should.eql(['a', 'b'])
        edit.should.eql([])
        ['1', '2']
      list.should.eql('1, 2')

    it 'saves comma', ->
      list = utils.editList 'a,\nb', (parsed, edit) ->
        ['1', '2']
      list.should.eql('1,\n2')

    it 'parse one value', ->
      list = utils.editList '1', (parsed, edit) ->
        [parsed[0], '2']
      list.should.eql('1, 2')
