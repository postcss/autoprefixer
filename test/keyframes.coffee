Keyframes = require('../lib/autoprefixer/keyframes')
CSS       = require('../lib/autoprefixer/css')
cases     = require('./lib/cases')

describe 'Keyframes', ->
  beforeEach ->
    @nodes      = cases.load('css')
    @rules      = @nodes.stylesheet.rules
    @css        = new CSS(@nodes.stylesheet)
    @css.number = 0
    @keyframes  = new Keyframes(@css, 0, @rules[0])

  describe 'clone()', ->

    it 'should clone node', ->
      @rules[0].one = 1
      @rules[0].keyframes[0].one = 1
      clone = @keyframes.clone()

      clone.one.should.eql 1
      clone.keyframes[0].one.should.eql 1

  describe 'cloneWithPrefix()', ->

    it 'should add prefix to clone', ->
      @keyframes.cloneWithPrefix('-moz-')

      @rules.length.should.eql(4)
      @rules[0].vendor.should == '-moz-'

  describe 'remove()', ->

    it 'should remove node', ->
      @keyframes.remove()
      @rules.length.should.eql(2)
