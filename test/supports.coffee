Prefixes = require('../lib/prefixes')
Browsers = require('../lib/browsers')
Supports = require('../lib/supports')
brackets = require('../lib/brackets')

data =
  browsers:
    firefox:
      prefix:   'moz'
      versions: ['firefox 22']
  prefixes:
    a:
      browsers: ['firefox 22']
    b:
      browsers: ['firefox 22']
      props: 'c'

describe 'Supports', ->
  before ->
    browsers  = new Browsers(data.browsers, ['firefox 22', 'firefox 21'])
    prefixes  = new Prefixes(data.prefixes, browsers)
    @supports = new Supports(Prefixes, prefixes)

  describe 'parse()', ->

    it 'splits property name and value', ->
      @supports.parse('color:black').should.eql(['color', 'black'])

    it 'cleans spaces', ->
      @supports.parse(' color : black ').should.eql(['color', 'black'])

    it 'parses everything', ->
      @supports.parse('color').should.eql(['color', ''])

  describe 'virtual()', ->

    it 'returns virtual rule', ->
      decl = @supports.virtual('color: black')
      decl.type.should.eql('rule')
      decl.toString().should.eql('a{color: black}')

    it 'works with broken CSS', ->
      decl = @supports.virtual('color black')
      decl.type.should.eql('rule')

  describe 'prefixed()', ->

    it 'returns decls with prefixed property', ->
      decls = @supports.prefixed('a: one')

      decls.length.should.eql(2)
      decls[0].toString().should.eql('-moz-a: one')
      decls[1].toString().should.eql('a: one')

    it 'returns decls with prefixed value', ->
      decls = @supports.prefixed('c: b')

      decls.length.should.eql(2)
      decls[0].toString().should.eql('c: -moz-b')
      decls[1].toString().should.eql('c: b')

  describe 'normalize()', ->

    it 'reduces empty string', ->
      @supports.normalize([['', ['a'], '']]).should.eql([[['a']]])

    it 'reduces declaration to string', ->
      @supports.normalize(['a: b', ['1']]).should.eql(['a: b(1)'])

    it 'reduces wrapped declaration to string', ->
      @supports.normalize(['', ['a: b', ['1']], '']).should.eql([['a: b(1)']])

  describe 'remove()', ->
    before ->
      @rm = (str) ->
        ast = @supports.normalize(brackets.parse(str))
        brackets.stringify(@supports.remove(ast, str))

    it 'remove prefixed properties', ->
      @rm('(-moz-a: 1) or (a: 1)').should.eql('(a: 1)')

    it 'remove prefixed properties inside', ->
      @rm('(((-moz-a: 1) or (a: 1)))').should.eql('(((a: 1)))')

    it 'remove prefixed values', ->
      @rm('(c: -moz-b) or (c: -b-)').should.eql('(c: -b-)')

    it 'keeps and-conditions', ->
      @rm('(-moz-a: 1) and (a: 1)').should.eql('(-moz-a: 1) and (a: 1)')

    it 'keeps not-conditions', ->
      @rm('not (-moz-a: 1) or (a: 1)').should.eql('not (-moz-a: 1) or (a: 1)')

    it 'keeps hacks', ->
      @rm('(-moz-a: 1) or (b: 2)').should.eql('(-moz-a: 1) or (b: 2)')

  describe 'prefixer()', ->

    it 'uses only browsers with @supports support', ->
      @supports.prefixer().browsers.selected.should.eql(['firefox 22'])

  describe 'cleanBrackets()', ->
    before ->
      @clean = (str) ->
        ast = @supports.normalize(brackets.parse(str))
        brackets.stringify(@supports.cleanBrackets(ast))

    it 'normalize brackets', ->
      @clean('((a: 1))').should.eql('(a: 1)')

    it 'normalize brackets recursively', ->
      @clean('(((a: 1) or ((b: 2))))').should.eql('((a: 1) or (b: 2))')

  describe 'process()', ->

    it 'adds params with prefixed value', ->
      rule = { params: '(c: b)' }
      @supports.process(rule)
      rule.params.should.eql('((c: -moz-b) or (c: b))')

    it 'adds params with prefixed function', ->
      rule = { params: '(c: b(1))' }
      @supports.process(rule)
      rule.params.should.eql('((c: -moz-b(1)) or (c: b(1)))')

    it 'replaces params with prefixed property', ->
      rule = { params: '(color black) and not (a: 1)' }
      @supports.process(rule)
      rule.params.should.eql('(color black) and not ((-moz-a: 1) or (a: 1))')
