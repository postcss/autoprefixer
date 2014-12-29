OldSelector = require('../lib/old-selector')
Selector    = require('../lib/selector')
parse       = require('postcss/lib/parse')

describe 'OldSelector', ->
  beforeEach ->
    selector = new Selector('::selection', ['-moz-', '-ms-'])
    @old     = selector.old('-moz-')

  describe 'isHack()', ->

    it 'returns true on last rule', ->
      css = parse('::selection {} ::-moz-selection {}')
      @old.isHack(css.last).should.be.true

    it 'stops on another type', ->
      css = parse('::-moz-selection {} @keyframes anim {} ::selection {}')
      @old.isHack(css.first).should.be.true

    it 'stops on another selector', ->
      css = parse('::-moz-selection {} a {} ::selection {}')
      @old.isHack(css.first).should.be.true

    it 'finds unprefixed selector', ->
      css = parse('::-moz-selection {} ::-o-selection {} ::selection {}')
      @old.isHack(css.first).should.be.false

  describe 'check()', ->

    it 'finds old selector', ->
      css = parse('body::-moz-selection {} body::selection {}')
      @old.check(css.first).should.be.true

    it 'finds right', ->
      css = parse('body:::-moz-selection {}')
      @old.check(css.first).should.be.false
