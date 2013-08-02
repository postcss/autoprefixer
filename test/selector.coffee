Selector = require('../lib/autoprefixer/selector')

describe 'Selector', ->
  beforeEach ->
    @selector = new Selector('::selection')

  describe 'prefixed()', ->

    it 'adds prefix after non-letters symbols', ->
      @selector.prefixed('-moz-').should.eql('::-moz-selection')

  describe 'check()', ->

    it 'shecks rule selectors', ->
      @selector.check('body ::selection').should.be.true
      @selector.check('body .selection').should.be.false

  describe 'replace()', ->

    it 'should add prefix to selectors', ->
      @selector.replace('body ::selection, input::selection, a', '-ms-').
        should.eql('body ::-ms-selection, input::-ms-selection, a')
