Prefixes = require('../lib/prefixes')
Browsers = require('../lib/browsers')
Supports = require('../lib/supports')

data =
  browsers:
    firefox:
      prefix:   'moz'
      versions: ['firefox 2']
  prefixes:
    a:
      browsers: ['firefox 2']
      transition: true

describe 'Supports', ->
  before ->
    browsers  = new Browsers(data.browsers, ['firefox 2'])
    prefixes  = new Prefixes(data.prefixes, browsers)
    @supports = new Supports(prefixes)

  describe 'virtual()', ->

    it 'returns virtual rule', ->
      decl = @supports.virtual('color', 'black')
      decl.type.should.eql('rule')
      decl.toString().should.eql('a{color: black}')

  describe 'prefixed()', ->

    it 'returns decls with prefixed property', ->
      decls = @supports.prefixed('a', 'one')

      decls.length.should.eql(2)
      decls[0].toString().should.eql('-moz-a: one')
      decls[1].toString().should.eql('a: one')

    it 'returns decls with prefixed value', ->
      decls = @supports.prefixed('transition', 'a')

      decls.length.should.eql(2)
      decls[0].toString().should.eql('transition: -moz-a')
      decls[1].toString().should.eql('transition: a')

  describe 'clean()', ->

    it 'remove prefixed properties', ->
      @supports.clean('(-moz-a: 1) or (a: 1)').should.eql('(a: 1)')

    it 'remove prefixed values', ->
      @supports.clean('(transition: -moz-a) or (transition: -a-)').
        should.eql('(transition: -a-)')

    it 'normalize brackets', ->
      @supports.clean('((-moz-a: 1) or (a: 1))').should.eql('(a: 1)')

    it 'keeps and-conditions', ->
      @supports.clean('(-moz-a: 1) and (a: 1)')
        .should.eql('(-moz-a: 1) and (a: 1)')

    it 'keeps not-conditions', ->
      @supports.clean('not (-moz-a: 1) or (a: 1)')
        .should.eql('not (-moz-a: 1) or (a: 1)')

    it 'allows hacks', ->
      @supports.clean('(-moz-a: 1)').should.eql('(-moz-a: 1)')


  describe 'process()', ->

    it 'replaces params with prefixed property', ->
      rule = { params: '(color black) and not (a: 1)' }
      @supports.process(rule)
      rule.params.should.eql('(color black) and not ((-moz-a: 1) or (a: 1))')

    it 'replaces params with prefixed property', ->
      rule = { params: '(transition: a)' }
      @supports.process(rule)
      rule.params.should.eql('((transition: -moz-a) or (transition: a))')
